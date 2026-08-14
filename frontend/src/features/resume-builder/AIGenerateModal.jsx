import React, { useState } from 'react';
import { Loader2, Sparkles, X, CheckCircle } from 'lucide-react';
import { useResumeBuilder } from './ResumeBuilderContext';

export default function AIGenerateModal({ isOpen, onClose }) {
  const { resume, STEPS, activeStep } = useResumeBuilder();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/ai/generate-resume/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          resume_data: resume, // In real scenario, we'd pass the actual formatted data
          template_info: { format: 'Professional' }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI content');
      }

      const data = await response.json();
      setGeneratedData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    // In a real app, this would dispatch actions to update the global resume state
    console.log("Applying data:", generatedData);
    alert('AI content applied to your resume!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="text-blue-500 w-5 h-5" />
            AI Resume Generation
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {!generatedData && !isGenerating && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Enhance your resume with AI</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Our AI will analyze your current information, improve your experience bullets, and write a professional summary without inventing fake details.
              </p>
              <button 
                onClick={handleGenerate}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" /> Generate Now
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-12 flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Analyzing your experience...</p>
              <p className="text-sm text-gray-400 mt-2">This usually takes about 10 seconds.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-center">
              {error}
              <button onClick={() => setError(null)} className="ml-4 underline text-sm">Try Again</button>
            </div>
          )}

          {generatedData && !isGenerating && (
            <div className="space-y-6">
              <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Content generated successfully
              </div>

              {generatedData.missing_information?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-2">Missing Information</h4>
                  <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                    {generatedData.missing_information.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Professional Summary</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 border border-gray-100">
                  {generatedData.professional_summary}
                </div>
              </div>

              {generatedData.organized_skills?.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Skills Organized</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedData.organized_skills.map((skill, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {generatedData && !isGenerating && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Apply to Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
