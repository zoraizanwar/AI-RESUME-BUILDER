import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { TemplateRenderer } from './TemplateRenderer';

export function PreviewPanel() {
  const { resumeData, zoomLevel, activeTemplate } = useEditorStore();

  return (
    <div className="flex-1 h-full bg-slate-200/50 overflow-auto flex flex-col items-center py-12 relative">
      <TemplateRenderer 
        templateId={activeTemplate} 
        resumeData={resumeData} 
        scale={zoomLevel / 100}
        className="origin-top transition-transform duration-200"
      />
    </div>
  );
}
