import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, FileText, CheckCircle2, 
  XCircle, AlertCircle, ArrowRight, Wand2, ArrowLeft, Loader2, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import api from '../services/api';
import { useEditorStore } from '../store/useEditorStore';

export function JobMatcher() {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [selectedResume, setSelectedResume] = useState('');
  const [resumesList, setResumesList] = useState([]);
  const [customFile, setCustomFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [isGeneratingTailored, setIsGeneratingTailored] = useState(false);
  const [tailorError, setTailorError] = useState('');
  const { resumeData } = useEditorStore();

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get('/resumes/');
        setResumesList(res.data);
        // Pre-select the first resume if list is not empty
        if (res.data && res.data.length > 0) {
          setSelectedResume(String(res.data[0].id));
        }
      } catch (err) {
        console.error("Failed to fetch resumes", err);
      }
    };
    fetchResumes();
  }, []);

  const getOrCreateVersionId = async () => {
    if (selectedResume === 'custom' && customFile) {
      const formData = new FormData();
      formData.append('file', customFile);
      const extractRes = await api.post('/ai/extract/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const parsed = extractRes.data;

      const title = parsed.personal_info?.name ? `${parsed.personal_info.name} Uploaded Resume` : 'Uploaded Resume';
      const createRes = await api.post('/resumes/', { title });
      const newResumeId = createRes.data.id;

      const createVer = await api.post('/versions/', { resume: newResumeId, version_name: 'Uploaded Draft', is_base: true });
      const versionId = createVer.data.id;

      const sectionsToCreate = [];
      if (parsed.personal_info) {
        sectionsToCreate.push({
          version: versionId,
          section_type: 'personal',
          title: 'Personal Information',
          content: {
            first_name: parsed.personal_info.name?.split(' ')[0] || '',
            last_name: parsed.personal_info.name?.split(' ').slice(1).join(' ') || '',
            email: parsed.personal_info.email || '',
            phone: parsed.personal_info.phone || '',
            location: parsed.personal_info.location || '',
            linkedin: parsed.personal_info.linkedin || '',
            website: parsed.personal_info.website || '',
            photo_url: ''
          },
          order: 0
        });
      }

      if (parsed.summary) {
        sectionsToCreate.push({
          version: versionId,
          section_type: 'summary',
          title: 'Professional Summary',
          content: { text: parsed.summary },
          order: 1
        });
      }

      let orderIdx = 2;
      (parsed.experience || []).forEach(item => {
        sectionsToCreate.push({
          version: versionId,
          section_type: 'experience',
          title: 'Work Experience',
          content: {
            company_name: item.company || '',
            job_title: item.title || '',
            start_date: item.start_date || '',
            end_date: item.end_date || 'Present',
            description: item.description || ''
          },
          order: orderIdx++
        });
      });

      (parsed.education || []).forEach(item => {
        sectionsToCreate.push({
          version: versionId,
          section_type: 'education',
          title: 'Education',
          content: {
            school_name: item.institution || '',
            degree: item.degree || '',
            field: item.field || '',
            start_date: item.start_date || '',
            end_date: item.end_date || ''
          },
          order: orderIdx++
        });
      });

      (parsed.skills || []).forEach(skillName => {
        sectionsToCreate.push({
          version: versionId,
          section_type: 'skills',
          title: 'Skills',
          content: { name: skillName },
          order: orderIdx++
        });
      });

      for (const sec of sectionsToCreate) {
        await api.post('/sections/', sec);
      }
      return versionId;
    } else if (selectedResume) {
      const resVersions = await api.get(`/versions/?resume=${selectedResume}`);
      const activeVersion = resVersions.data.find(v => v.is_base) || resVersions.data[0];
      if (!activeVersion) {
        throw new Error("No version found for the selected resume.");
      }
      return activeVersion.id;
    }
    return null;
  };

  const handleAnalyze = async () => {
    if (!jobDescription || !selectedResume) return;
    setIsAnalyzing(true);
    setError('');

    try {
      // 1. Get or create resume version ID
      const versionId = await getOrCreateVersionId();
      if (!versionId) {
        throw new Error("No resume version available for matching.");
      }

      // 2. Save the job description to backend to get an ID
      const resJob = await api.post('/jobs/', {
        title: 'Target Job Description',
        company: 'Target Company',
        description_text: jobDescription
      });
      const jobId = resJob.data.id;

      // 3. Perform match on the persistent matching endpoint
      const res = await api.post(`/jobs/${jobId}/match/`, {
        resume_version_id: versionId
      });
      setResults(res.data);
      setIsAnalyzed(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to match resume to job description. Ensure the backend is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setIsAnalyzed(false);
    setJobDescription('');
    setResults(null);
  };

  const handleTailorResume = async () => {
    if (!jobDescription || !selectedResume) return;
    setIsGeneratingTailored(true);
    setTailorError('');
    
    try {
      let customResumeText = '';
      
      if (selectedResume === 'custom' && customFile) {
        const formData = new FormData();
        formData.append('file', customFile);
        const parseRes = await api.post('/ai/parse-text/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        customResumeText = parseRes.data.text;
      } else if (selectedResume) {
        const versionId = await getOrCreateVersionId();
        const versionRes = await api.get(`/versions/${versionId}/`);
        const sections = versionRes.data.sections || [];
        let resumeText = "";
        sections.forEach(sec => {
          resumeText += `\n\n--- ${sec.title} ---\n`;
          if (typeof sec.content === 'object' && sec.content !== null) {
            Object.entries(sec.content).forEach(([k, v]) => {
              resumeText += `${k}: ${v}\n`;
            });
          } else {
            resumeText += String(sec.content);
          }
        });
        customResumeText = resumeText;
      }

      const payload = {
        custom_resume_text: customResumeText || 'No resume data provided.',
        job_description_text: jobDescription
      };

      const res = await api.post('/ai/optimize/', payload);
      // Pass the optimized data to the editor route
      navigate('/app/resumes/new/edit', { state: { tailoredData: res.data } });
    } catch (err) {
      console.error(err);
      setTailorError(err.response?.data?.error || 'Failed to generate tailored resume.');
    } finally {
      setIsGeneratingTailored(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Job Matcher</h1>
        <p className="text-muted-foreground mt-1">Compare your resume against a job description and generate a perfectly tailored version.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!isAnalyzed ? (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8 relative">
            
            {/* Left: Job Description */}
            <Card className="h-full flex flex-col shadow-sm border-indigo-100">
              <CardHeader className="bg-indigo-50/50 border-b pb-4">
                <CardTitle className="flex items-center text-lg text-indigo-900">
                  <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                  Target Job Description
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <textarea 
                  className="w-full h-full min-h-[400px] p-6 resize-none outline-none text-slate-700 bg-transparent"
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                ></textarea>
              </CardContent>
            </Card>

            {/* Right: Select Resume */}
            <Card className="h-full flex flex-col shadow-sm">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <CardTitle className="flex items-center text-lg text-slate-900">
                  <FileText className="w-5 h-5 mr-2 text-slate-500" />
                  Your Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select a base resume to compare</label>
                <select 
                  className="w-full appearance-none bg-white border border-input rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm mb-6"
                  value={selectedResume}
                  onChange={(e) => {
                    setSelectedResume(e.target.value);
                    setCustomFile(null);
                  }}
                >
                  <option value="" disabled>Select a resume...</option>
                  {resumesList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title || 'Untitled Resume'} (ID: {r.id})
                    </option>
                  ))}
                </select>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500 font-semibold tracking-wider">Or upload custom</span>
                  </div>
                </div>

                <div>
                   <input type="file" accept=".pdf,.docx" onChange={(e) => {
                     const file = e.target.files[0];
                     if (file) {
                       setCustomFile(file);
                       setSelectedResume('custom');
                     }
                   }} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                </div>

                {(selectedResume && !customFile && selectedResume !== 'custom') && (
                  <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-dashed text-center animate-in fade-in">
                     <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                     <p className="text-sm font-medium text-slate-700">Resume selected and ready for analysis.</p>
                  </div>
                )}
                {customFile && (
                  <div className="mt-8 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 border-dashed text-center animate-in fade-in">
                     <FileText className="w-12 h-12 text-indigo-300 mx-auto mb-2" />
                     <p className="text-sm font-medium text-indigo-700">{customFile.name} ready for analysis.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analyze Button (Center overlap on desktop) */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-white p-2 rounded-full shadow-xl">
                <Button 
                  size="lg" 
                  className="rounded-full w-16 h-16 p-0 shadow-inner bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  onClick={handleAnalyze}
                  disabled={!jobDescription || !selectedResume || isAnalyzing}
                >
                  {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <ArrowRight className="w-6 h-6 text-white" />}
                </Button>
              </div>
            </div>

          </div>
          
          {/* Mobile Analyze Button */}
          <div className="md:hidden flex justify-center mt-4">
            <Button 
              size="lg" 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={handleAnalyze}
              disabled={!jobDescription || !selectedResume || isAnalyzing}
            >
              {isAnalyzing ? <span className="flex items-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</span> : 'Analyze Match'}
            </Button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          
          <Button variant="ghost" onClick={handleReset} className="mb-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Editor
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column: Score & Primary Action */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-indigo-100 shadow-md">
                <CardHeader className="text-center pb-2 bg-indigo-50/50 rounded-t-xl">
                  <CardTitle className="text-indigo-900">Match Score</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center pt-8 pb-8">
                  <div className="text-6xl font-extrabold text-indigo-600 tracking-tighter">
                    {results?.match_percentage || 0}<span className="text-3xl text-indigo-300">/100</span>
                  </div>
                  {results?.match_details?.match_classification && (
                    <Badge className="mt-3 bg-indigo-100 text-indigo-800 hover:bg-indigo-100 font-semibold uppercase px-3 py-1 text-xs tracking-wider border-none">
                      {results.match_details.match_classification}
                    </Badge>
                  )}
                  <p className="text-center text-sm text-slate-600 mt-4 px-4 font-medium">
                    {results?.match_percentage >= 80 ? 'Excellent match! You are highly qualified for this role.' : 
                     results?.match_percentage >= 60 ? 'Solid foundation, but missing a few key requirements.' : 
                     results?.match_percentage >= 40 ? 'Partial match. Significant gaps found.' :
                     'Weak Match. This role appears to be in a different domain or requires completely different skills.'}
                  </p>
                </CardContent>
              </Card>

              {/* Detailed Score Breakdown */}
              {results?.match_details && (
                <Card className="border-indigo-100 shadow-md">
                  <CardHeader className="pb-3 border-b bg-indigo-50/20">
                    <CardTitle className="text-sm font-bold text-indigo-900 flex items-center">
                      <Sparkles className="w-4 h-4 text-indigo-600 mr-2" />
                      Detailed Compatibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    {[
                      { label: "Role Relevance (30%)", data: results.match_details.role_compatibility },
                      { label: "Required Skills (25%)", data: results.match_details.skills_match },
                      { label: "Responsibilities (20%)", data: results.match_details.responsibility_match },
                      { label: "Domain Match (10%)", data: results.match_details.domain_match },
                      { label: "Experience Match (10%)", data: results.match_details.experience_match },
                      { label: "Education Match (3%)", data: results.match_details.education_match },
                      { label: "Transferable Skills (2%)", data: results.match_details.transferable_skills },
                    ].map((item, index) => {
                      if (!item.data) return null;
                      const score = item.data.score ?? 0;
                      const reason = item.data.reason || "";
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-700">{item.label}</span>
                            <span className={`font-bold ${score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{score}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-500 ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          {reason && <p className="text-[10px] text-slate-500 italic leading-snug mt-0.5">{reason}</p>}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Wand2 className="w-24 h-24" />
                </div>
                <h3 className="text-xl font-bold mb-2 relative z-10">Create Tailored Resume</h3>
                <p className="text-indigo-100 text-sm mb-6 relative z-10">
                  Let our AI generate a new version of your resume specifically optimized for this job description.
                </p>
                <Button 
                  className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold relative z-10" 
                  size="lg"
                  onClick={handleTailorResume}
                  disabled={isGeneratingTailored}
                >
                  {isGeneratingTailored ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {isGeneratingTailored ? 'Generating...' : 'Generate Now'}
                </Button>
                {tailorError && <p className="text-rose-200 text-sm mt-2 relative z-10">{tailorError}</p>}
              </div>
            </div>

            {/* Right Column: Breakdown */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Role Analysis */}
              {results?.role_analysis && (
                <Card className="border-indigo-100 shadow-sm">
                  <CardHeader className="pb-3 border-b bg-indigo-50/30">
                    <CardTitle className="text-base flex items-center text-indigo-900">
                      <Briefcase className="w-5 h-5 text-indigo-600 mr-2" />
                      Role & Domain Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold text-slate-700 block">Candidate Role:</span>
                        <span className="text-slate-600">{results.role_analysis.candidate_role} ({results.role_analysis.candidate_domain})</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 block">Job Role:</span>
                        <span className="text-slate-600">{results.role_analysis.job_role} ({results.role_analysis.job_domain})</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 block">Alignment:</span>
                      <span className="text-slate-600">{results.role_analysis.core_responsibilities_match}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Matched Skills */}
                <Card>
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" />
                      Matched Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {results?.matched_skills?.map((skill, i) => (
                      <div key={i} className="text-sm">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 mb-1">
                          {skill.requirement || skill}
                        </Badge>
                        {skill.evidence && <p className="text-xs text-slate-500 ml-1">Evidence: {skill.evidence}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Missing Skills */}
                <Card>
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base flex items-center">
                      <XCircle className="w-5 h-5 text-rose-500 mr-2" />
                      Missing Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {results?.missing_skills?.map((skill, i) => (
                      <div key={i} className="text-sm">
                        <Badge variant="destructive" className="bg-rose-50 text-rose-700 hover:bg-rose-50 mb-1">
                          {skill.requirement || skill}
                        </Badge>
                        {skill.evidence && <p className="text-xs text-rose-500 ml-1">{skill.evidence}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Partial Matches */}
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex items-center">
                    <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
                    Partial Matches & Experience Gaps
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {results?.partial_matches?.map((match, i) => (
                    <div key={i} className="flex flex-col gap-1 text-sm text-slate-700 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                      <div className="font-semibold text-amber-900">Resume: {match.resume_skill} &rarr; Job: {match.job_skill}</div>
                      <p className="text-slate-600">{match.explanation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Things to Improve (Action Plan) */}
              <Card className="border-indigo-100 shadow-sm bg-indigo-50/30">
                <CardHeader className="pb-3 border-b border-indigo-100">
                  <CardTitle className="text-base flex items-center text-indigo-900">
                    <Sparkles className="w-5 h-5 text-indigo-600 mr-2" />
                    How to Improve for this Role
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {results?.recommendations?.map((improvement, i) => (
                    <div key={i} className="flex gap-3 bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                      <div className="bg-indigo-100 text-indigo-700 font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-700">{improvement}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Critical Gaps */}
                {results?.critical_gaps?.length > 0 && (
                  <Card className="border-rose-200 bg-rose-50/30">
                    <CardHeader className="pb-3 border-b border-rose-100">
                      <CardTitle className="text-base text-rose-800 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Critical Role Gaps
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="list-disc pl-5 space-y-1 text-sm text-rose-700">
                        {results.critical_gaps.map((gap, i) => (
                          <li key={i}>{gap}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Irrelevant Skills */}
                {results?.irrelevant_skills?.length > 0 && (
                  <Card className="border-slate-200 bg-slate-50">
                    <CardHeader className="pb-3 border-b border-slate-200">
                      <CardTitle className="text-base text-slate-700 flex items-center">
                        <XCircle className="w-5 h-5 mr-2" />
                        Irrelevant Skills Found
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex flex-wrap gap-2">
                        {results.irrelevant_skills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="border-slate-300 text-slate-500 bg-white">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Important Keywords */}
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base">Important Domain Keywords Missing</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    {results?.keyword_gaps?.map(keyword => (
                      <Badge key={keyword} variant="outline" className="border-slate-200 text-slate-600">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
