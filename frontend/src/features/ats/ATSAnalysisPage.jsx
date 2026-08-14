import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ATSAnalysisPage() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  
  const [resumeVersion, setResumeVersion] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const res = await api.get(`/versions/?resume=${resumeId}`);
        const currentVersion = res.data.find(v => v.is_base) || res.data[0];
        setResumeVersion(currentVersion);
      } catch (err) {
        console.error("Failed to fetch version", err);
        setError("Failed to load resume.");
      }
    };
    fetchVersion();
  }, [resumeId]);

  const handleAnalyze = async () => {
    if (!resumeVersion) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post('/ats/analyze/', {
        resume_version_id: resumeVersion.id,
        job_description: jobDescription
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const CircleProgress = ({ score, label }) => {
    const color = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500';
    return (
      <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className={`text-4xl font-bold ${color}`}>{score}</div>
        <div className="text-xs text-gray-500 mt-2 font-semibold uppercase">{label}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">ATS Resume Analyzer</h1>
          <button onClick={() => navigate(`/build/${resumeId}`)} className="text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; Back to Editor
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-bold mb-2">Target Job Description (Optional)</h2>
          <p className="text-gray-500 text-sm mb-4">Paste the job description here to see how well your resume matches the specific role.</p>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Paste job description..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resumeVersion}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing...' : 'Run ATS Analysis'}
            </button>
          </div>
          {error && <div className="text-red-500 mt-4 text-sm font-semibold">{error}</div>}
        </div>

        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="col-span-2 md:col-span-1">
                <CircleProgress score={result.overall_score} label="Overall Match" />
              </div>
              <CircleProgress score={result.keyword_score} label="Keywords" />
              <CircleProgress score={result.skills_score} label="Skills/Title" />
              <CircleProgress score={result.experience_score} label="Experience" />
              <CircleProgress score={result.formatting_score} label="Formatting" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Keyword Analysis</h3>
                
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-green-600 mb-2">Matched Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.matched_keywords.length > 0 ? (
                      result.matched_keywords.map((k, i) => (
                        <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">{k}</span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">None detected</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-red-600 mb-2">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_keywords.length > 0 ? (
                      result.missing_keywords.map((k, i) => (
                        <span key={i} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">{k}</span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">None detected</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Actionable Recommendations</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-gray-600">{rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Formatting Risks</h3>
                  {result.formatting_risks.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {result.formatting_risks.map((risk, i) => (
                        <li key={i} className="text-sm text-red-600">{risk}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-green-600 font-semibold">No critical formatting risks detected.</p>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-8">
              Disclaimer: This score provides a simulated compatibility check based on standard ATS rules and semantic AI analysis. It does not guarantee exactly how any specific vendor's ATS will parse your resume.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
