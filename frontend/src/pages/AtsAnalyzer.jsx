import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, XCircle, ChevronRight, 
  Sparkles, FileText, UploadCloud, Target, AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useEditorStore } from '../store/useEditorStore';

// A simple SVG-based circular progress component
const CircularProgress = ({ value, label }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  let color = "text-emerald-500";
  if (value < 80) color = "text-amber-500";
  if (value < 60) color = "text-rose-500";

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      {/* Background Circle */}
      <svg className="transform -rotate-90 w-48 h-48">
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-slate-100"
        />
        {/* Progress Circle */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${color} transition-all duration-1000 ease-out`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-bold text-slate-900">{value}</span>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
    </div>
  );
};

const MetricBar = ({ label, value }) => {
  let color = "bg-emerald-500";
  if (value < 80) color = "bg-amber-500";
  if (value < 60) color = "bg-rose-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
};

export function AtsAnalyzer() {
  const [selectedResume, setSelectedResume] = useState('current');
  const [customFile, setCustomFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const navigate = useNavigate();
  const { resumeData } = useEditorStore();

  const getOrCreateVersionId = async () => {
    if (selectedResume === 'current') {
      const resResumes = await api.get('/resumes/');
      const latestResume = resResumes.data[0];
      if (!latestResume) {
        const createRes = await api.post('/resumes/', { title: 'Untitled Resume' });
        const createVer = await api.post('/versions/', { resume: createRes.data.id, version_name: 'Base Version', is_base: true });
        return createVer.data.id;
      }
      const resVersions = await api.get(`/versions/?resume=${latestResume.id}`);
      const activeVersion = resVersions.data.find(v => v.is_base) || resVersions.data[0];
      return activeVersion.id;
    } else if (selectedResume === 'custom' && customFile) {
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

      await Promise.all(sectionsToCreate.map(sec => api.post('/sections/', sec)));
      return versionId;
    }
    return null;
  };

  const handleAnalyze = async () => {
    if (!selectedResume) return;
    setIsAnalyzing(true);
    setError('');

    try {
      const versionId = await getOrCreateVersionId();
      if (!versionId) {
        throw new Error("No resume version available for analysis.");
      }

      const payload = {
        resume_version_id: versionId,
        job_description: jobDescription
      };

      const res = await api.post('/ats/analyze/', payload);
      setResults(res.data);
      setIsAnalyzed(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to analyze ATS compatibility. Ensure the backend is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Mock data for the ATS Analysis
  const overallScore = 87;
  const metrics = [
    { label: 'Keyword Match', value: 85 },
    { label: 'Skills Match', value: 92 },
    { label: 'Experience Relevance', value: 78 },
    { label: 'Formatting', value: 100 },
    { label: 'Readability', value: 88 },
  ];

  const recommendations = {
    missingKeywords: [
      {
        keyword: 'REST API',
        severity: 'high',
        why: 'The job description mentions REST APIs as a required core skill.',
        action: 'Consider explicitly mentioning your existing REST API experience in your backend project descriptions.',
      },
      {
        keyword: 'GraphQL',
        severity: 'medium',
        why: 'Often requested alongside React roles, adding this increases searchability.',
        action: 'Add GraphQL to your Skills section if you have used it.',
      }
    ],
    needsImprovement: [
      {
        title: 'Quantify Experience Results',
        severity: 'medium',
        why: 'Some bullet points list responsibilities rather than measurable achievements.',
        action: 'Rewrite the 2nd bullet point under "Software Engineer" to include specific metrics (e.g., "Increased performance by 20%").',
      }
    ],
    strongAreas: [
      {
        title: 'Perfect Formatting',
        why: 'Your resume uses a single-column layout with standard fonts that are perfectly parsed by standard ATS software.',
      },
      {
        title: 'Strong Core Skills Match',
        why: 'You have exactly matched 8 of the 10 critical hard skills found in the target job description.',
      }
    ]
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />;
      default: return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ATS Analyzer</h1>
        <p className="text-muted-foreground mt-1">See your resume exactly how an Applicant Tracking System sees it.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start gap-4 w-full mb-8">
        <div className="flex-1 space-y-4 w-full">
           <select 
             className="appearance-none bg-white border border-input rounded-md pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-64"
             value={selectedResume}
             onChange={(e) => {
               setSelectedResume(e.target.value);
               if (e.target.value !== 'custom') setCustomFile(null);
             }}
           >
             <option value="current">Current Resume (from Editor)</option>
             <option value="custom">Custom Upload...</option>
           </select>
           {selectedResume === 'custom' && (
             <input type="file" accept=".pdf,.docx" onChange={(e) => {
               if (e.target.files[0]) {
                 setCustomFile(e.target.files[0]);
                 setIsAnalyzed(false);
               }
             }} className="text-sm text-slate-500 w-full file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
           )}
           <textarea
             className="flex min-h-[100px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
             placeholder="Paste the target Job Description here (Optional but recommended for accurate keyword matching)..."
             value={jobDescription}
             onChange={(e) => setJobDescription(e.target.value)}
           ></textarea>
        </div>
        <Button onClick={handleAnalyze} disabled={isAnalyzing} className="md:mt-0 h-[100px] w-full md:w-48 flex flex-col justify-center text-base">
           {isAnalyzing ? (
             <><Sparkles className="w-5 h-5 mb-2 animate-spin" /> Analyzing...</>
           ) : (
             <><Sparkles className="w-5 h-5 mb-2" /> Analyze / Refresh</>
           )}
        </Button>
      </div>

      {!isAnalyzed ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Target className="w-16 h-16 text-slate-200 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">Ready to Analyze</h2>
          <p className="text-muted-foreground mt-2 max-w-md">Upload your job description or select a resume, then click analyze to see your ATS score and recommendations.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
        
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-indigo-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Overall ATS Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-6 pb-8">
              <div className="relative flex items-center justify-center">
                <CircularProgress value={results?.overall_score || 0} />
              </div>
              <p className="text-center text-sm text-slate-600 mt-6 font-medium">
                {results?.overall_score >= 80 ? 'Excellent' : results?.overall_score >= 60 ? 'Good' : 'Needs Work'}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <MetricBar label="Keyword Match" value={results?.keyword_score || 0} />
            <MetricBar label="Formatting" value={results?.formatting_score || 0} />
            <MetricBar label="Experience Fit" value={results?.experience_score || 0} />
            <MetricBar label="Skills Fit" value={results?.skills_score || 0} />
          </div>
          
          <Button 
            className="w-full h-12 text-base font-semibold shadow-md border border-indigo-600/20" 
            size="lg"
            onClick={() => navigate('/app/job-matcher')}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Improve Resume with AI
          </Button>
        </div>

        <div className="lg:col-span-8 space-y-6">
          
          <section>
             <div className="flex items-center gap-2 mb-4">
               <Target className="w-5 h-5 text-indigo-600" />
               <h2 className="text-xl font-bold text-slate-900">Missing Keywords</h2>
             </div>
             <div className="grid gap-4">
               {results?.missing_keywords?.map((keyword, i) => (
                 <div key={i} className="bg-white rounded-xl border p-5 shadow-sm">
                   <div className="flex items-center gap-3">
                     <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                     <h3 className="font-semibold text-slate-900">{keyword}</h3>
                   </div>
                 </div>
               ))}
             </div>
          </section>

          <section className="mt-8">
             <div className="flex items-center gap-2 mb-4">
               <AlertTriangle className="w-5 h-5 text-amber-500" />
               <h2 className="text-xl font-bold text-slate-900">Needs Improvement</h2>
             </div>
             <div className="grid gap-4">
               {results?.formatting_risks?.length === 0 ? (
                 <div className="text-sm text-emerald-600 font-medium">No formatting risks detected. Good job!</div>
               ) : (
                 results?.formatting_risks?.map((risk, i) => (
                   <div key={i} className="bg-white rounded-xl border p-5 shadow-sm">
                     <div className="flex gap-4 items-start">
                       <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                       <div className="space-y-3 flex-1">
                         <p className="text-sm text-slate-700">{risk}</p>
                       </div>
                     </div>
                   </div>
                 ))
               )}
             </div>
          </section>

          <section className="mt-8">
             <div className="flex items-center gap-2 mb-4">
               <CheckCircle2 className="w-5 h-5 text-emerald-500" />
               <h2 className="text-xl font-bold text-slate-900">Strong Areas</h2>
             </div>
             <CardContent className="pt-6 space-y-4">
                {results?.recommendations?.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start bg-indigo-50/50 p-4 rounded-lg border border-indigo-100/50">
                    <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 leading-relaxed">{item}</p>
                    </div>
                  </div>
                ))}
             </CardContent>
          </section>

          <p className="text-xs text-slate-400 mt-8">
            Note: ATS systems vary widely in how they parse documents. This tool evaluates based on common industry best practices for textual parsing and keyword matching, but cannot guarantee compatibility with every proprietary system.
          </p>

        </div>
      </div>
      )}
    </div>
  );
}
