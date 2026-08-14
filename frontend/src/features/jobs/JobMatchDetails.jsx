import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TailorResumeModal from './TailorResumeModal';

const JobMatchDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeVersionId, setSelectedResumeVersionId] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    fetchResumes();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}/`);
      setJob(response.data);
    } catch (error) {
      console.error('Failed to fetch job:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes/');
      setResumes(response.data);
      if (response.data.length > 0) {
        // Find the base version of the first resume as default
        const baseVersion = response.data[0].versions.find(v => v.is_base);
        if (baseVersion) {
          setSelectedResumeVersionId(baseVersion.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    }
  };

  const handleMatch = async () => {
    if (!selectedResumeVersionId) return;
    setAnalyzing(true);
    try {
      const response = await api.post(`/jobs/${jobId}/match/`, {
        resume_version_id: selectedResumeVersionId
      });
      setMatchResult(response.data);
    } catch (error) {
      console.error('Failed to match resume:', error);
      alert('Failed to analyze job match.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading job details...</div>;
  if (!job) return <div className="text-center py-10">Job not found.</div>;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button onClick={() => navigate('/jobs')} className="text-blue-600 hover:underline mb-2 inline-block">&larr; Back to Dashboard</button>
          <h1 className="text-3xl font-bold">{job.title || 'Untitled Job'}</h1>
          <p className="text-xl text-gray-600">{job.company}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Job Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-lg shadow border">
            <h2 className="text-xl font-bold mb-4">Job Requirements</h2>
            {job.parsed_data?.required_skills?.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700">Required Skills</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.parsed_data.required_skills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {job.parsed_data?.important_keywords?.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700">Key Terms</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.parsed_data.important_keywords.map((kw, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">{kw}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <a href={job.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">View Original Posting</a>
            </div>
          </div>
        </div>

        {/* Right Column: Matcher */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-lg shadow border">
            <h2 className="text-xl font-bold mb-4">Evaluate Resume Match</h2>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Resume to Match</label>
                <select 
                  className="w-full border rounded p-2"
                  value={selectedResumeVersionId}
                  onChange={(e) => setSelectedResumeVersionId(e.target.value)}
                >
                  <option value="">-- Select a Resume --</option>
                  {resumes.map(resume => (
                    <optgroup key={resume.id} label={resume.title}>
                      {resume.versions.map(version => (
                        <option key={version.id} value={version.id}>
                          {version.version_name} {version.is_base ? '(Base)' : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleMatch}
                  disabled={analyzing || !selectedResumeVersionId}
                  className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Match'}
                </button>
                <button
                  onClick={() => setIsTailorModalOpen(true)}
                  disabled={analyzing || !selectedResumeVersionId}
                  className="bg-purple-600 text-white font-bold py-2 px-6 rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  Optimize Resume ✨
                </button>
              </div>
            </div>
          </div>

          {matchResult && (
            <div className="bg-white p-6 rounded-lg shadow border space-y-8">
              <div className="flex items-center justify-between pb-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold">Match Results</h2>
                  <p className="text-gray-600">Based on semantic AI analysis</p>
                  {matchResult.match_details?.match_classification && (
                    <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase tracking-wider">
                      {matchResult.match_details.match_classification}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <div className={`text-5xl font-bold ${matchResult.match_percentage >= 80 ? 'text-green-600' : matchResult.match_percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {matchResult.match_percentage}%
                  </div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide mt-1">Match Score</div>
                </div>
              </div>

              {/* Detailed Score Breakdown */}
              {matchResult.match_details && (
                <div className="bg-slate-50/55 p-5 rounded-lg border border-slate-100 space-y-4">
                  <h3 className="text-md font-bold text-slate-800 flex items-center mb-3">
                    <span className="mr-2">✨</span> Compatibility Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {[
                      { label: "Role Relevance (30%)", data: matchResult.match_details.role_compatibility },
                      { label: "Required Skills (25%)", data: matchResult.match_details.skills_match },
                      { label: "Responsibilities (20%)", data: matchResult.match_details.responsibility_match },
                      { label: "Domain Match (10%)", data: matchResult.match_details.domain_match },
                      { label: "Experience Match (10%)", data: matchResult.match_details.experience_match },
                      { label: "Education Match (3%)", data: matchResult.match_details.education_match },
                      { label: "Transferable Skills (2%)", data: matchResult.match_details.transferable_skills },
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
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-500 ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          {reason && <p className="text-[10px] text-slate-500 italic leading-snug mt-0.5">{reason}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-green-700 mb-3 flex items-center">
                    <span className="mr-2">✓</span> Matched Skills
                  </h3>
                  <ul className="space-y-2">
                    {matchResult.matched_skills.map((skill, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">•</span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                  {matchResult.matched_skills.length === 0 && <p className="text-gray-500 italic">No direct matches found.</p>}
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center">
                    <span className="mr-2">✗</span> Missing Skills
                  </h3>
                  <ul className="space-y-2">
                    {matchResult.missing_skills.map((skill, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">•</span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                  {matchResult.missing_skills.length === 0 && <p className="text-gray-500 italic">No missing skills found!</p>}
                </div>
              </div>

              {matchResult.partial_matches?.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-bold text-yellow-700 mb-3 flex items-center">
                    <span className="mr-2">~</span> Partial / Semantic Matches
                  </h3>
                  <div className="space-y-4">
                    {matchResult.partial_matches.map((pm, i) => (
                      <div key={i} className="bg-yellow-50 p-3 rounded text-sm">
                        <div className="font-semibold text-yellow-800 mb-1">
                          Required: {pm.job_skill} <span className="text-gray-400 font-normal">→</span> Found: {pm.resume_skill}
                        </div>
                        <p className="text-gray-700">{pm.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchResult.recommendations?.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-bold text-blue-800 mb-3">AI Recommendations</h3>
                  <ul className="space-y-2">
                    {matchResult.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start bg-blue-50 p-3 rounded text-blue-900 text-sm">
                        <span className="mr-2 font-bold">💡</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
      <TailorResumeModal
        isOpen={isTailorModalOpen}
        onClose={() => setIsTailorModalOpen(false)}
        resumeVersionId={selectedResumeVersionId}
        jobDescriptionId={jobId}
      />
    </div>
  );
};

export default JobMatchDetails;
