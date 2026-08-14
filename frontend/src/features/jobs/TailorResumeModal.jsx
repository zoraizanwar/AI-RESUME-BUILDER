import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const TailorResumeModal = ({ isOpen, onClose, resumeVersionId, jobDescriptionId }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleOptimize = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/ai/optimize/', {
        resume_version_id: resumeVersionId,
        job_description_id: jobDescriptionId
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to optimize resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!result) return;
    setLoading(true);
    try {
      // 1. Create new version by duplicating the original
      const duplicateRes = await api.post(`/versions/${resumeVersionId}/duplicate/`, {
        version_name: 'Optimized for Job',
        purpose: `Optimized for Job ${jobDescriptionId}`
      });
      const newVersionId = duplicateRes.data.id;
      const resumeId = duplicateRes.data.resume;
      
      // 2. Fetch the newly duplicated sections to update them or just wipe and recreate
      // The duplicated version already has the old sections. We need to overwrite them.
      // Easiest is to delete old sections of the NEW version, and insert tailored ones.
      const existingSections = duplicateRes.data.sections;
      for (const sec of existingSections) {
        await api.delete(`/sections/${sec.id}/`);
      }

      // 3. Save optimized sections
      for (let i = 0; i < result.tailored_sections.length; i++) {
        const sec = result.tailored_sections[i];
        await api.post('/sections/', {
          version: newVersionId,
          section_type: sec.section_type,
          title: sec.title,
          content: sec.content,
          order: i
        });
      }
      
      navigate(`/build/${resumeId}`);
    } catch (err) {
      console.error(err);
      setError('Failed to save optimized resume.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold">Optimize Resume for Job</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          
          {!result && !loading && (
            <div className="text-center py-10">
              <p className="text-lg text-gray-600 mb-6">Click below to generate a new resume version specifically tailored for this job.</p>
              <button 
                onClick={handleOptimize}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105"
              >
                Generate Optimized Version ✨
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600 animate-pulse">Analyzing job description and tailoring resume...</p>
            </div>
          )}

          {result && !loading && (
            <div>
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="font-bold text-blue-800 mb-2">Changelog & Revisions</h3>
                <ul className="space-y-4">
                  {result.changelog.map((log, idx) => (
                    <li key={idx} className="bg-white p-3 rounded shadow-sm border border-blue-100">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-gray-800">{log.section}</span>
                        <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                          log.change_type === 'added' ? 'bg-green-100 text-green-700' :
                          log.change_type === 'modified' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {log.change_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 italic">"{log.reason}"</p>
                      
                      {log.original && log.new && (
                        <div className="grid grid-cols-2 gap-4 text-xs font-mono mt-2">
                          <div className="bg-red-50 text-red-800 p-2 border border-red-200 rounded">
                            <span className="block font-bold mb-1 border-b border-red-200 pb-1">Original:</span>
                            {log.original}
                          </div>
                          <div className="bg-green-50 text-green-800 p-2 border border-green-200 rounded">
                            <span className="block font-bold mb-1 border-b border-green-200 pb-1">New:</span>
                            {log.new}
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                {result.changelog.length === 0 && (
                  <p className="text-gray-500">No major changes were deemed necessary.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {result && !loading && (
          <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
            <button 
              onClick={onClose}
              className="px-6 py-2 border rounded text-gray-700 hover:bg-gray-100 font-medium"
            >
              Reject & Close
            </button>
            <button 
              onClick={handleAccept}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium shadow"
            >
              Accept & Save as New Version
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TailorResumeModal;
