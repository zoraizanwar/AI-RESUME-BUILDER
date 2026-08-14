import React from 'react';
import { useResumeBuilder } from './ResumeBuilderContext';
import { Check, Circle } from 'lucide-react';

export default function Stepper() {
  const { STEPS, activeStep, setActiveStep, sections } = useResumeBuilder();

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col hidden md:flex">
      <h3 className="font-bold text-gray-800 mb-6">Resume Sections</h3>
      <div className="space-y-4">
        {STEPS.map((step, index) => {
          const isCompleted = sections.some(s => s.section_type === step.id);
          const isActive = index === activeStep;
          
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(index)}
              className={`flex items-center w-full text-left p-2 rounded-md transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                isCompleted ? 'bg-green-100 text-green-600' : 
                isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? <Check size={14} /> : <Circle size={14} />}
              </div>
              <span className="text-sm">{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
