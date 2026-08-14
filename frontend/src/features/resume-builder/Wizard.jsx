import React, { useState, useEffect } from 'react';
import { useResumeBuilder } from './ResumeBuilderContext';
import Stepper from './Stepper';
import PersonalInfoForm from './forms/PersonalInfoForm';
import SummaryForm from './forms/SummaryForm';
import ExperienceForm from './forms/ExperienceForm';
import EducationForm from './forms/EducationForm';
import ProjectsForm from './forms/ProjectsForm';
import SkillsForm from './forms/SkillsForm';
import CertificationsForm from './forms/CertificationsForm';
import AwardsForm from './forms/AwardsForm';
import LanguagesForm from './forms/LanguagesForm';
import VolunteerForm from './forms/VolunteerForm';
import CustomSectionsForm from './forms/CustomSectionsForm';
import { Loader2, AlertCircle, Sparkles, Upload } from 'lucide-react';
import AIGenerateModal from './AIGenerateModal';
import ImportResumeModal from './ImportResumeModal';

export default function Wizard() {
  const { 
    isLoading, isSaving, error, activeStep, STEPS, resume 
  } = useResumeBuilder();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  const renderForm = () => {
    switch (STEPS[activeStep].id) {
      case 'personal': return <PersonalInfoForm />;
      case 'summary': return <SummaryForm />;
      case 'experience': return <ExperienceForm />;
      case 'education': return <EducationForm />;
      case 'projects': return <ProjectsForm />;
      case 'skills': return <SkillsForm />;
      case 'certifications': return <CertificationsForm />;
      case 'awards': return <AwardsForm />;
      case 'languages': return <LanguagesForm />;
      case 'volunteer': return <VolunteerForm />;
      case 'custom': return <CustomSectionsForm />;
      default: return <div>Unknown step</div>;
    }
  };

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      <Stepper />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">{resume?.title || 'Resume Builder'}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all font-medium shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Import Resume
            </button>
            <button 
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </button>
            <div className="flex items-center">
              {isSaving && <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Saving...</>}
              {!isSaving && <span>All changes saved</span>}
            </div>
          </div>
        </header>

        <AIGenerateModal 
          isOpen={isAIModalOpen} 
          onClose={() => setIsAIModalOpen(false)} 
        />

        <ImportResumeModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
        />

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 p-4 border-l-4 border-red-500 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Form Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
             <h2 className="text-2xl font-bold text-gray-800 mb-6">{STEPS[activeStep].title}</h2>
             {renderForm()}
          </div>
        </main>
      </div>
    </div>
  );
}
