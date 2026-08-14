import React, { useState } from 'react';
import { Download, FileText, File, Loader2, Monitor, AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '../ui/dialog';
import { Button } from '../ui/button';
import html2pdf from 'html2pdf.js';

import { useEditorStore } from '../../store/useEditorStore';
import api from '../../services/api';

export function DownloadDialog({ resumeTitle = 'Untitled Resume', children }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState(null); // 'pdf' | 'docx'
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const resumeData = useEditorStore((state) => state.resumeData);
  const activeTemplate = useEditorStore((state) => state.activeTemplate);

  const handleDownload = async (format) => {
    setDownloadFormat(format);
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    if (format === 'pdf') {
      try {
        const element = document.getElementById('resume-preview-container');
        if (!element) throw new Error("Resume container not found");
        
        // Temporarily reset transform for clean PDF generation
        const originalTransform = element.style.transform;
        element.style.transform = 'scale(1)';

        const opt = {
          margin: 0,
          filename: `${resumeTitle.replace(/\\s+/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(element).save();
        
        // Restore transform
        element.style.transform = originalTransform;
        
        setSuccess(true);
      } catch (err) {
        console.error(err);
        setError("Failed to generate PDF. Please try again.");
      } finally {
        setIsGenerating(false);
        setTimeout(() => setSuccess(false), 3000);
      }
    } else if (format === 'docx') {
      try {
        const res = await api.post('/documents/generate/', {
          template_id: activeTemplate || 'modern',
          resume_data: resumeData
        });
        
        if (res.data && res.data.download_url) {
          let downloadPath = res.data.download_url;
          if (downloadPath.startsWith('/api/v1')) {
            downloadPath = downloadPath.substring('/api/v1'.length);
          }
          const downloadRes = await api.get(downloadPath, { responseType: 'blob' });
          const url = window.URL.createObjectURL(new Blob([downloadRes.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${resumeTitle.replace(/\\s+/g, '_')}.docx`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          setSuccess(true);
        } else {
          throw new Error('No download URL returned');
        }
      } catch (err) {
        console.error(err);
        setError("Failed to generate DOCX. Please try again.");
      } finally {
        setIsGenerating(false);
        setTimeout(() => setSuccess(false), 3000);
      }
    }
  };

  const handlePreview = () => {
    window.print();
  };

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        // Reset state when closed
        setIsGenerating(false);
        setError(null);
        setSuccess(false);
        setDownloadFormat(null);
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Resume</DialogTitle>
          <DialogDescription>
            Download your completed resume as a PDF or Word Document.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Resume Summary */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 border rounded-lg mb-6">
            <div className="w-10 h-14 bg-white border shadow-sm flex items-center justify-center shrink-0 text-slate-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm truncate" title={resumeTitle}>{resumeTitle}</h4>
              <div className="flex text-xs text-slate-500 mt-1 gap-2">
                <span>Template: Modern</span>
                <span>•</span>
                <span>1 Page</span>
              </div>
            </div>
          </div>

          {/* Status Area */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-md flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Downloaded successfully! Check your downloads folder.</span>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            <Button 
              className="w-full justify-start h-12 relative overflow-hidden group" 
              variant="outline"
              disabled={isGenerating}
              onClick={() => handleDownload('pdf')}
            >
              <div className="flex items-center w-full">
                <File className="w-5 h-5 mr-3 text-red-500" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-slate-700">Download PDF</span>
                  <span className="text-xs text-slate-500 font-normal">Best for email and ATS systems</span>
                </div>
              </div>
              {isGenerating && downloadFormat === 'pdf' && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm transition-all">
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin mr-2" />
                  <span className="text-sm font-medium text-indigo-700">Generating PDF...</span>
                </div>
              )}
            </Button>

            <Button 
              className="w-full justify-start h-12 relative overflow-hidden group" 
              variant="outline"
              disabled={isGenerating}
              onClick={() => handleDownload('docx')}
            >
              <div className="flex items-center w-full">
                <FileText className="w-5 h-5 mr-3 text-blue-500" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-slate-700">Download DOCX</span>
                  <span className="text-xs text-slate-500 font-normal">Editable Word Document</span>
                </div>
              </div>
              {isGenerating && downloadFormat === 'docx' && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm transition-all">
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin mr-2" />
                  <span className="text-sm font-medium text-indigo-700">Generating DOCX...</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-between border-t pt-4">
          <Button variant="ghost" size="sm" onClick={handlePreview} className="text-slate-500 hidden sm:flex">
            <Monitor className="w-4 h-4 mr-2" /> Preview Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
