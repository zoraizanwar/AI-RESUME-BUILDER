import React, { useState } from 'react';
import { 
  Briefcase, FileText, CheckCircle2, 
  Mic, AlertCircle, ArrowRight, Wand2, ArrowLeft, Loader2, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import api from '../services/api';
import { useEditorStore } from '../store/useEditorStore';

export function InterviewPrep() {
  const [jobDescription, setJobDescription] = useState('');
  const [selectedResume, setSelectedResume] = useState('');
  const [customFile, setCustomFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState({
    technical_questions: [],
    behavioral_questions: [],
    project_questions: [],
    experience_questions: [],
    hr_questions: []
  });
  const { resumeData } = useEditorStore();

  const handleGenerate = async () => {
    if (!selectedResume) return;
    setIsGenerating(true);
    setError('');

    try {
      let customResumeText = '';
      
      // If custom file, parse it first
      if (selectedResume === 'custom' && customFile) {
        const formData = new FormData();
        formData.append('file', customFile);
        const parseRes = await api.post('/ai/parse-text/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        customResumeText = parseRes.data.text;
      } else if (selectedResume === 'current') {
        customResumeText = JSON.stringify(resumeData, null, 2);
      }

      // Generate prep
      const payload = {
        custom_resume_text: customResumeText || 'No resume data provided.',
        job_description_text: jobDescription
      };

      const res = await api.post('/ai/interview-prep/', payload);
      setResults(res.data);
      setIsGenerated(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to generate interview questions. Ensure the backend is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setIsGenerated(false);
    setJobDescription('');
  };


  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Interview Prep</h1>
        <p className="text-muted-foreground mt-1">Generate tailored interview questions based on your resume and the target job.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!isGenerated ? (
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Select a base resume</label>
                <select 
                  className="w-full appearance-none bg-white border border-input rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm mb-6"
                  value={selectedResume}
                  onChange={(e) => {
                    setSelectedResume(e.target.value);
                    setCustomFile(null);
                  }}
                >
                  <option value="" disabled>Select a saved resume...</option>
                  <option value="current">Current Resume (from Editor)</option>
                  <option value="custom" disabled hidden>Custom Upload</option>
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

            {/* Generate Button (Center overlap on desktop) */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-white p-2 rounded-full shadow-xl">
                <Button 
                  size="lg" 
                  className="rounded-full w-16 h-16 p-0 shadow-inner bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  onClick={handleGenerate}
                  disabled={!selectedResume || isGenerating}
                >
                  {isGenerating ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Wand2 className="w-6 h-6 text-white" />}
                </Button>
              </div>
            </div>

          </div>
          
          {/* Mobile Generate Button */}
          <div className="md:hidden flex justify-center mt-4">
            <Button 
              size="lg" 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={handleGenerate}
              disabled={!selectedResume || isGenerating}
            >
              {isGenerating ? <span className="flex items-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</span> : 'Generate Questions'}
            </Button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          
          <Button variant="ghost" onClick={handleReset} className="mb-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Prep Form
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column: Quick Tips */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Mic className="w-24 h-24" />
                </div>
                <h3 className="text-xl font-bold mb-2 relative z-10">Interview Success</h3>
                <p className="text-indigo-100 text-sm mb-6 relative z-10">
                  These questions are tailored to exactly what the hiring manager will see on your resume compared to their job description.
                </p>
                <div className="space-y-3 relative z-10">
                   <div className="flex items-start gap-2 text-sm bg-black/10 p-3 rounded-lg">
                     <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                     <p>Use the STAR method for behavioral questions.</p>
                   </div>
                   <div className="flex items-start gap-2 text-sm bg-black/10 p-3 rounded-lg">
                     <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                     <p>Be honest about gaps, but pivot to how you're learning.</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Right Column: Questions */}
            <div className="lg:col-span-2 space-y-6">
              
              {results?.hr_questions?.length > 0 && (
                <Card>
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base flex items-center">
                      <FileText className="w-5 h-5 text-blue-500 mr-2" />
                      HR & Screening Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-6">
                    {results.hr_questions.map((q, i) => (
                      <div key={i} className="space-y-2">
                        <p className="font-semibold text-slate-900">{i+1}. {q.question}</p>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">AI Tip:</span>
                          <p className="text-sm text-slate-700 mt-1 mb-3">{q.answer_guidance || q.focus_area}</p>
                          {q.sample_answer && (
                            <>
                              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Sample Answer:</span>
                              <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{q.sample_answer}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {results?.experience_questions?.length > 0 && (
                <Card>
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base flex items-center">
                      <Briefcase className="w-5 h-5 text-purple-500 mr-2" />
                      Experience & Role Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-6">
                    {results.experience_questions.map((q, i) => (
                      <div key={i} className="space-y-2">
                        <p className="font-semibold text-slate-900">{i+1}. {q.question}</p>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-700">AI Tip:</span>
                          <p className="text-sm text-slate-700 mt-1 mb-3">{q.answer_guidance || q.focus_area}</p>
                          {q.sample_answer && (
                            <>
                              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Sample Answer:</span>
                              <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{q.sample_answer}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {results?.project_questions?.length > 0 && (
                <Card>
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base flex items-center">
                      <FileText className="w-5 h-5 text-indigo-500 mr-2" />
                      Resume Deep Dives (Projects)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-6">
                    {results.project_questions.map((q, i) => (
                      <div key={i} className="space-y-2">
                        <p className="font-semibold text-slate-900">{i+1}. {q.question}</p>
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">AI Tip:</span>
                          <p className="text-sm text-slate-700 mt-1 mb-3">{q.answer_guidance || q.focus_area}</p>
                          {q.sample_answer && (
                            <>
                              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Sample Answer:</span>
                              <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{q.sample_answer}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {results?.technical_questions?.length > 0 && (
                <Card>
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base flex items-center">
                      <Wand2 className="w-5 h-5 text-emerald-500 mr-2" />
                      Technical Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-6">
                    {results.technical_questions.map((q, i) => (
                      <div key={i} className="space-y-2">
                        <p className="font-semibold text-slate-900">{i+1}. {q.question}</p>
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">AI Tip:</span>
                          <p className="text-sm text-slate-700 mt-1 mb-3">{q.answer_guidance || q.focus_area}</p>
                          {q.sample_answer && (
                            <>
                              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Sample Answer:</span>
                              <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{q.sample_answer}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              
              {results?.behavioral_questions?.length > 0 && (
                <Card>
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base flex items-center">
                      <Briefcase className="w-5 h-5 text-amber-500 mr-2" />
                      Behavioral Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-6">
                    {results.behavioral_questions.map((q, i) => (
                      <div key={i} className="space-y-2">
                        <p className="font-semibold text-slate-900">{i+1}. {q.question}</p>
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">AI Tip:</span>
                          <p className="text-sm text-slate-700 mt-1 mb-3">{q.answer_guidance || q.focus_area}</p>
                          {q.sample_answer && (
                            <>
                              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Sample Answer:</span>
                              <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{q.sample_answer}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
