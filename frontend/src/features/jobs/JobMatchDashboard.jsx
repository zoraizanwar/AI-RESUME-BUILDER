import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const JobMatchDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', description_text: '', url: '' });
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/');
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      const response = await api.post('/jobs/', newJob);
      setJobs([response.data, ...jobs]);
      setShowAddModal(false);
      setNewJob({ title: '', company: '', description_text: '', url: '' });
      // navigate(`/jobs/${response.data.id}`);
    } catch (error) {
      console.error('Failed to analyze job:', error);
      alert('Failed to analyze job description.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Matcher</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
        >
          + Add Job Description
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No jobs saved yet.</p>
          <p className="text-sm text-gray-400">Add a job description to see how your resume matches.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-lg shadow border p-5 flex flex-col h-full cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/jobs/${job.id}`)}>
              <h3 className="text-xl font-semibold mb-1 truncate">{job.title || 'Untitled Job'}</h3>
              <p className="text-gray-600 mb-4">{job.company}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
                <button 
                  className="text-blue-600 font-medium hover:text-blue-800 text-sm"
                  onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`); }}
                >
                  View Details &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Add Job Description</h2>
            <form onSubmit={handleAddJob}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded p-2"
                    value={newJob.company}
                    onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job URL (Optional)</label>
                  <input
                    type="url"
                    className="w-full border rounded p-2"
                    value={newJob.url}
                    onChange={(e) => setNewJob({...newJob, url: e.target.value})}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                <textarea
                  required
                  rows={10}
                  className="w-full border rounded p-2 font-mono text-sm"
                  placeholder="Paste the full job description here..."
                  value={newJob.description_text}
                  onChange={(e) => setNewJob({...newJob, description_text: e.target.value})}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  disabled={analyzing}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={analyzing || !newJob.company || !newJob.description_text}
                  className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {analyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing with AI...
                    </>
                  ) : 'Analyze Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatchDashboard;
