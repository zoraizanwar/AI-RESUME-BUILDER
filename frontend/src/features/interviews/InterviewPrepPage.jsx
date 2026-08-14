import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const QuestionCard = ({ title, questions }) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">{title}</h3>
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={idx} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold text-indigo-700 mb-2">Q: {q.question}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
              <div className="bg-blue-50 p-3 rounded">
                <span className="font-bold text-blue-800 block mb-1">Why it's asked:</span>
                <p className="text-gray-700">{q.why_asked}</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <span className="font-bold text-green-800 block mb-1">What to focus on:</span>
                <p className="text-gray-700">{q.focus_area}</p>
              </div>
            </div>
            {q.answer_guidance && (
              <div className="mt-3 bg-purple-50 p-3 rounded text-sm">
                <span className="font-bold text-purple-800 block mb-1">Answer Guidance:</span>
                <p className="text-gray-700">{q.answer_guidance}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function InterviewPrepPage() {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState('');
  
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [prepData, setPrepData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [resumeId]);

  const fetchInitialData = async () => {
    try {
      const [versionsRes, jobsRes] = await Promise.all([
        api.get(`/versions/?resume=${resumeId}`),
        api.get('/jobs/')
      ]);
      
      const vData = versionsRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setVersions(vData);
      if (vData.length > 0) {
        setSelectedVersion(vData.find(v => v.is_base)?.id || vData[0].id);
      }

      setJobs(jobsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load initial data.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedVersion) {
      alert("Please select a resume version.");
      return;
    }

    setGenerating(true);
    setError('');
    setPrepData(null);

    try {
      const payload = { resume_version_id: selectedVersion };
      if (selectedJob) {
        payload.job_description_id = selectedJob;
      }
      const response = await api.post('/ai/interview-prep/', payload);
      setPrepData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to generate interview preparation.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">AI Interview Preparation</h1>
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-800 font-semibold">
          Back to Dashboard
        </button>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* Configuration Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4">Preparation Setup</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Select Resume Version <span className="text-red-500">*</span></label>
              <select 
                value={selectedVersion} 
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="w-full border rounded-md p-2 focus:ring focus:ring-indigo-200 outline-none"
              >
                <option value="">-- Select a Version --</option>
                {versions.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.version_name} {v.purpose ? `(${v.purpose})` : ''} {v.is_base ? '[Base]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Target Job Description (Optional)</label>
              <select 
                value={selectedJob} 
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full border rounded-md p-2 focus:ring focus:ring-indigo-200 outline-none"
              >
                <option value="">-- General Interview --</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title} at {j.company}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">If selected, questions will be tailored to this specific role.</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleGenerate} 
              disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md shadow disabled:opacity-50 transition-colors"
            >
              {generating ? 'Generating Questions...' : 'Generate Interview Guide'}
            </button>
          </div>
          
          {error && <div className="mt-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        </div>

        {/* Results Panel */}
        {generating && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p>Analyzing your experience and generating tailored interview questions...</p>
          </div>
        )}

        {!generating && prepData && (
          <div className="bg-white rounded-lg shadow-sm border p-6 flex-1">
            <h2 className="text-2xl font-bold mb-6 text-indigo-900 border-b pb-4">Your Interview Guide</h2>
            
            <QuestionCard title="HR & Screening" questions={prepData.hr_questions} />
            <QuestionCard title="Behavioral & Situational" questions={prepData.behavioral_questions} />
            <QuestionCard title="Experience & Background" questions={prepData.experience_questions} />
            <QuestionCard title="Project Deep Dives" questions={prepData.project_questions} />
            <QuestionCard title="Technical & Domain Specific" questions={prepData.technical_questions} />
            
          </div>
        )}
      </main>
    </div>
  );
}
