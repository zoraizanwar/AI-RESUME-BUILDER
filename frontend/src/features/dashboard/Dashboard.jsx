import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Edit, Trash2, FileText, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes/');
      setResumes(res.data);
    } catch (err) {
      console.error("Failed to fetch resumes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const createNewResume = async () => {
    setCreating(true);
    try {
      const res = await api.post('/resumes/', {
        title: 'Untitled Resume'
      });
      // The API creates the Resume. We will create the Base Version inside the Wizard.
      navigate(`/build/${res.data.id}`);
    } catch (err) {
      console.error("Failed to create resume", err);
      setCreating(false);
    }
  };

  const deleteResume = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await api.delete(`/resumes/${id}/`);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.email}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/jobs')} 
              className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-4 py-2 rounded-md"
            >
              Job Matcher
            </button>
            <button 
              onClick={() => navigate('/templates')} 
              className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-4 py-2 rounded-md"
            >
              Manage Templates
            </button>
            <button 
              onClick={logout} 
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create New Card */}
          <div 
            onClick={!creating ? createNewResume : undefined}
            className={`border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 hover:border-blue-400 transition min-h-[250px] ${creating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {creating ? (
              <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-2" />
            ) : (
              <Plus className="h-10 w-10 text-gray-400 mb-3" />
            )}
            <h3 className="text-lg font-medium text-gray-900">Create New Resume</h3>
            <p className="text-gray-500 text-sm mt-1">Start from scratch</p>
          </div>

          {/* Existing Resumes */}
          {resumes.map(resume => (
            <div key={resume.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between min-h-[250px] hover:shadow-md transition">
              <div>
                <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <FileText size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{resume.title}</h3>
                <p className="text-gray-500 text-sm">Updated {new Date(resume.updated_at).toLocaleDateString()}</p>
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 flex-wrap gap-2">
                <button 
                  onClick={() => navigate(`/build/${resume.id}`)}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  <Edit size={16} className="mr-1" /> Edit
                </button>
                <button 
                  onClick={() => navigate(`/interview/${resume.id}`)}
                  className="flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm"
                >
                   Prep Interview
                </button>
                <button 
                  onClick={() => deleteResume(resume.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition ml-auto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
