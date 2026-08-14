import React, { useState, useRef } from 'react';
import { Loader2, Upload, FileText, X, AlertCircle } from 'lucide-react';
import { useResumeBuilder } from './ResumeBuilderContext';

export default function ImportResumeModal({ isOpen, onClose }) {
  const { resume, updateResume } = useResumeBuilder();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      return;
    }

    const isValidFormat = file.name.endsWith('.pdf') || file.name.endsWith('.docx');
    if (!isValidFormat) {
      setError("Only PDF and DOCX files are supported");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/v1/ai/extract-resume/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract resume');
      }

      const data = await response.json();
      
      const mapping = {
        personal_info: 'personal',
        summary: 'summary',
        experience: 'experience',
        education: 'education',
        projects: 'projects',
        skills: 'skills',
        certifications: 'certifications',
        awards: 'awards',
        languages: 'languages',
        custom_sections: 'custom'
      };

      // Save each section
      for (const [key, sectionType] of Object.entries(mapping)) {
        if (data[key]) {
          let content = data[key];
          if (key === 'summary' && typeof content === 'string') {
            content = { text: content };
          } else if (key === 'skills' && Array.isArray(content)) {
            content = content.map(s => ({ name: s, level: 'Intermediate' }));
          }
          await saveSection(sectionType, content);
        }
      }

      alert('Resume extracted successfully! Please review the populated sections.');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full text-gray-500">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Upload className="text-blue-500 w-6 h-6" />
          Import Resume
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Upload an existing PDF or DOCX resume. Our AI will extract the contents so you don't have to type everything from scratch.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors
            ${isUploading ? 'bg-gray-50 border-gray-200' : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 cursor-pointer'}
          `}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
              <p className="font-medium text-gray-700">Extracting data...</p>
              <p className="text-sm text-gray-500 mt-1">This may take up to 30 seconds</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FileText className="w-10 h-10 text-blue-500 mb-3" />
              <p className="font-medium text-gray-700 mb-1">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">PDF or DOCX (max 5MB)</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.docx"
            disabled={isUploading}
          />
        </div>
        
        <div className="mt-4 bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800 border border-yellow-200">
          <strong>Note:</strong> AI extraction is not perfect. You will be able to review and edit all extracted information before it is saved.
        </div>
      </div>
    </div>
  );
}
