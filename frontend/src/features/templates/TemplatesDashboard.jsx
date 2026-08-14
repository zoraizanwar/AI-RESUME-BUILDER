import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { UploadCloud, FileText, Trash2, X, Loader2, RefreshCw } from 'lucide-react';

export default function TemplatesDashboard() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/templates/');
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await api.delete(`/templates/${id}/`);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Templates</h1>
            <p className="text-gray-600 mt-1">Manage your DOCX resume templates</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => navigate('/')} 
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
            <button 
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
            >
              <UploadCloud size={18} className="mr-2" />
              Upload Template
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templates.map(tmpl => (
              <div key={tmpl.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                <div className="bg-gray-100 h-32 flex items-center justify-center border-b border-gray-200 relative">
                   <FileText size={48} className="text-gray-400" />
                   <button 
                     onClick={() => handleDelete(tmpl.id)}
                     className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-red-500 hover:bg-red-100 transition"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 mb-1 truncate">{tmpl.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">{tmpl.description || 'No description'}</p>
                  
                  <div className="mt-auto">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Detected Placeholders</h4>
                    <div className="flex flex-wrap gap-1">
                      {tmpl.fields && tmpl.fields.length > 0 ? (
                        tmpl.fields.slice(0, 5).map(f => (
                          <span key={f.id} className="inline-block bg-blue-50 text-blue-700 text-[10px] px-2 py-1 rounded-full font-mono">
                            {'{'}{'{'}{f.name}{'}'}{'}'}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No placeholders found</span>
                      )}
                      {tmpl.fields && tmpl.fields.length > 5 && (
                        <span className="inline-block bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-full">
                          +{tmpl.fields.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {templates.length === 0 && (
              <div className="col-span-full bg-white rounded-xl border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center">
                <UploadCloud size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
                <p className="text-gray-500 mb-4">Upload a DOCX file with {"{{PLACEHOLDERS}}"} to get started.</p>
                <button 
                  onClick={() => setUploadModalOpen(true)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded shadow-sm hover:bg-gray-50"
                >
                  Upload your first template
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload Modal */}
        {uploadModalOpen && (
          <UploadModal 
            onClose={() => setUploadModalOpen(false)} 
            onSuccess={() => {
              setUploadModalOpen(false);
              fetchTemplates();
            }} 
          />
        )}
      </div>
    </div>
  );
}

function UploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.docx')) {
        setError('Only .docx files are supported.');
        setFile(null);
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size must be under 5MB.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selected);
      if (!name) {
        setName(selected.name.replace('.docx', ''));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !name) return;
    
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('description', description);

    try {
      await api.post('/templates/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.file?.[0] || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800">Upload Template</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleUpload} className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">DOCX File *</label>
            <input 
              type="file" 
              accept=".docx"
              onChange={handleFileChange}
              required
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">Max size: 5MB.</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              rows="3" 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!file || !name || uploading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <><RefreshCw size={18} className="mr-2 animate-spin" /> Processing...</>
              ) : (
                'Upload & Extract'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
