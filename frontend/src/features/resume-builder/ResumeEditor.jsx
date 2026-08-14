import React, { useState } from 'react';
import Wizard from './Wizard';
import LivePreview from './LivePreview';
import { useResumeBuilder } from './ResumeBuilderContext';
import html2pdf from 'html2pdf.js';
import api from '../../services/api';

import { useNavigate } from 'react-router-dom';
import VersionManagerModal from './VersionManagerModal';

export default function ResumeEditor() {
  const { resume, version, loadData, changeVersion } = useResumeBuilder();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isVersionManagerOpen, setIsVersionManagerOpen] = useState(false);
  const navigate = useNavigate();

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    const element = document.getElementById('live-preview-container');
    const opt = {
      margin:       0,
      filename:     `resume_${resume?.id || 'draft'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
      // 1. Generate PDF blob
      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
      
      if (resume && version && resume.template) {
        // 2. Upload to backend for secure endpoint
        const formData = new FormData();
        formData.append('resume_version_id', version.id);
        formData.append('template_id', resume.template);
        formData.append('file', pdfBlob, opt.filename);
        
        const response = await api.post('/documents/upload_pdf/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // 3. Download via secure endpoint
        if (response.data && response.data.download_url) {
          window.location.href = response.data.download_url;
        } else {
          html2pdf().set(opt).from(element).save(); // Fallback
        }
      } else {
        // Just download directly if no template attached
        html2pdf().set(opt).from(element).save();
      }
    } catch (error) {
      console.error("PDF Generation Error", error);
      alert("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Left Panel: Editing Controls */}
      <div className="w-full md:w-1/2 h-full flex flex-col border-r border-gray-300 bg-white shadow-xl z-10 overflow-hidden">
        <Wizard />
      </div>
      
      {/* Right Panel: Live Preview */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto bg-gray-200 p-4 md:p-8 relative custom-scrollbar">
        <div className="absolute top-4 right-8 flex gap-2 z-10">
          <button 
            onClick={() => setIsVersionManagerOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1 rounded-full shadow-sm text-xs font-bold transition-colors"
          >
            Manage Versions
          </button>
          <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm text-xs font-semibold text-gray-500 border border-gray-200 flex items-center">
            Live Preview
          </div>
          <button 
            onClick={() => navigate(`/ats/${resume?.id}`)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1 rounded-full shadow-sm text-xs font-bold transition-colors"
          >
            ATS Analysis
          </button>
          <button 
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded-full shadow-sm text-xs font-bold transition-colors disabled:opacity-50"
          >
            {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
        
        {/* Scale wrapper to fit a standard US Letter roughly, but fully responsive */}
        <div className="w-full h-full flex justify-center">
          <div id="live-preview-container" className="w-full flex justify-center">
            <LivePreview />
          </div>
        </div>
      </div>
      {resume && version && (
        <VersionManagerModal
          isOpen={isVersionManagerOpen}
          onClose={() => setIsVersionManagerOpen(false)}
          resumeId={resume.id}
          activeVersionId={version.id}
          onVersionSelect={(vId) => changeVersion(vId)}
        />
      )}
    </div>
  );
}
