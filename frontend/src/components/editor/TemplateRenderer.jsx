import React from 'react';
import { ModernBlueTemplate } from './templates/ModernBlueTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { ExecutiveTemplate } from './templates/ExecutiveTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { AtsProfessionalTemplate } from './templates/AtsProfessionalTemplate';
import { ModernTwoColumnTemplate } from './templates/ModernTwoColumnTemplate';

export function TemplateRenderer({ templateId, resumeData, scale = 1, className = '' }) {
  const renderTemplate = () => {
    switch (templateId) {
      case 'modern-blue':
        return <ModernBlueTemplate data={resumeData} />;
      case 'minimal':
        return <MinimalTemplate data={resumeData} />;
      case 'executive':
        return <ExecutiveTemplate data={resumeData} />;
      case 'creative':
        return <CreativeTemplate data={resumeData} />;
      case 'ats-professional':
        return <AtsProfessionalTemplate data={resumeData} />;
      case 'modern-two-column':
        return <ModernTwoColumnTemplate data={resumeData} />;
      default:
        // Fallback to modern-blue but log a warning
        console.warn(`Template ID ${templateId} not recognized. Falling back to modern-blue.`);
        return <ModernBlueTemplate data={resumeData} />;
    }
  };

  const hasNoPadding = ['creative', 'modern-two-column', 'modern-blue'].includes(templateId);

  return (
    <div 
      id="resume-preview-container"
      className={`bg-white shadow-2xl origin-top-left ring-1 ring-slate-900/5 ${className}`}
      style={{
        width: '210mm',
        minHeight: '297mm', // A4 dimensions
        transform: `scale(${scale})`,
        padding: hasNoPadding ? '0' : '20mm',
      }}
    >
      {renderTemplate()}
    </div>
  );
}
