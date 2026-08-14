import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const VersionManagerModal = ({ isOpen, onClose, resumeId, activeVersionId, onVersionSelect }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States for rename/edit purpose
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPurpose, setEditPurpose] = useState('');

  // States for compare
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersionId, setCompareVersionId] = useState(null);
  const [compareVersionData, setCompareVersionData] = useState(null);
  const [activeVersionData, setActiveVersionData] = useState(null);

  useEffect(() => {
    if (isOpen && resumeId) {
      fetchVersions();
      setCompareMode(false);
      setCompareVersionId(null);
      setCompareVersionData(null);
    }
  }, [isOpen, resumeId]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/versions/?resume=${resumeId}`);
      // Sort by creation date descending
      const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setVersions(sorted);
      
      const active = sorted.find(v => v.id === activeVersionId);
      setActiveVersionData(active);
    } catch (err) {
      setError('Failed to fetch versions');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (versionId) => {
    try {
      await api.post(`/versions/${versionId}/duplicate/`);
      fetchVersions();
    } catch (err) {
      alert('Failed to duplicate version');
    }
  };

  const handleDelete = async (versionId) => {
    if (versions.length <= 1) {
      alert('Cannot delete the last remaining version.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this version?')) {
      try {
        await api.delete(`/versions/${versionId}/`);
        fetchVersions();
        if (activeVersionId === versionId) {
          // If deleted active version, reload page to get a new active one
          window.location.reload();
        }
      } catch (err) {
        alert('Failed to delete version');
      }
    }
  };

  const startEdit = (version) => {
    setEditingId(version.id);
    setEditName(version.version_name);
    setEditPurpose(version.purpose || '');
  };

  const saveEdit = async () => {
    try {
      await api.patch(`/versions/${editingId}/`, {
        version_name: editName,
        purpose: editPurpose
      });
      setEditingId(null);
      fetchVersions();
    } catch (err) {
      alert('Failed to update version');
    }
  };

  const toggleCompare = async (version) => {
    if (compareMode && compareVersionId === version.id) {
      setCompareMode(false);
      setCompareVersionId(null);
      setCompareVersionData(null);
    } else {
      setCompareMode(true);
      setCompareVersionId(version.id);
      setCompareVersionData(version);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <div className={`bg-white rounded-lg shadow-xl ${compareMode ? 'w-full max-w-7xl' : 'w-full max-w-4xl'} max-h-[90vh] flex flex-col transition-all duration-300`}>
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">Version History</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto flex gap-6">
          <div className={`${compareMode ? 'w-1/3' : 'w-full'}`}>
            {loading ? (
              <p>Loading versions...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="space-y-4">
                {versions.map(version => (
                  <div key={version.id} className={`border rounded p-4 ${activeVersionId === version.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} ${compareVersionId === version.id ? 'ring-2 ring-purple-500' : ''}`}>
                    
                    {editingId === version.id ? (
                      <div className="mb-2">
                        <input 
                          type="text" 
                          value={editName} 
                          onChange={e => setEditName(e.target.value)} 
                          className="w-full p-2 border rounded mb-2 text-sm font-bold"
                          placeholder="Version Name"
                        />
                        <input 
                          type="text" 
                          value={editPurpose} 
                          onChange={e => setEditPurpose(e.target.value)} 
                          className="w-full p-2 border rounded mb-2 text-sm"
                          placeholder="Purpose (e.g., Software Engineer Role)"
                        />
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700">Save</button>
                          <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-3 py-1 rounded text-xs font-bold hover:bg-gray-500">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-lg text-gray-800">
                            {version.version_name}
                            {activeVersionId === version.id && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase">Active</span>}
                            {version.is_base && <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full uppercase">Base</span>}
                          </h3>
                        </div>
                        {version.purpose && <p className="text-sm text-purple-700 font-medium mb-1">Target: {version.purpose}</p>}
                        <p className="text-xs text-gray-500">Created: {new Date(version.created_at).toLocaleString()}</p>
                      </div>
                    )}

                    {!editingId && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                        {activeVersionId !== version.id && (
                          <button onClick={() => { onVersionSelect(version.id); onClose(); }} className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded font-bold">Switch To</button>
                        )}
                        <button onClick={() => startEdit(version)} className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded font-bold">Edit Info</button>
                        <button onClick={() => handleDuplicate(version.id)} className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded font-bold">Duplicate</button>
                        <button onClick={() => toggleCompare(version)} className={`text-xs px-3 py-1 rounded font-bold ${compareVersionId === version.id ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
                          {compareVersionId === version.id ? 'Close Compare' : 'Compare'}
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(version.id)} 
                          className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded font-bold ml-auto"
                          disabled={versions.length <= 1}
                          title={versions.length <= 1 ? "Cannot delete the last version" : ""}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comparison View */}
          {compareMode && compareVersionData && activeVersionData && (
            <div className="w-2/3 border-l pl-6 flex gap-4 overflow-x-auto">
              <div className="w-1/2 flex-shrink-0 bg-gray-50 p-4 rounded border h-full overflow-y-auto">
                <h4 className="font-bold text-center mb-4 bg-blue-100 text-blue-800 p-2 rounded">Active: {activeVersionData.version_name}</h4>
                {activeVersionData.sections.map(sec => (
                  <div key={sec.id} className="mb-4 bg-white p-3 shadow-sm border rounded">
                    <h5 className="font-bold text-sm border-b pb-1 mb-2">{sec.title}</h5>
                    <pre className="text-xs whitespace-pre-wrap font-sans text-gray-700">{JSON.stringify(sec.content, null, 2)}</pre>
                  </div>
                ))}
              </div>
              <div className="w-1/2 flex-shrink-0 bg-gray-50 p-4 rounded border h-full overflow-y-auto">
                <h4 className="font-bold text-center mb-4 bg-purple-100 text-purple-800 p-2 rounded">Comparing: {compareVersionData.version_name}</h4>
                {compareVersionData.sections.map(sec => (
                  <div key={sec.id} className="mb-4 bg-white p-3 shadow-sm border rounded">
                    <h5 className="font-bold text-sm border-b pb-1 mb-2">{sec.title}</h5>
                    <pre className="text-xs whitespace-pre-wrap font-sans text-gray-700">{JSON.stringify(sec.content, null, 2)}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionManagerModal;
