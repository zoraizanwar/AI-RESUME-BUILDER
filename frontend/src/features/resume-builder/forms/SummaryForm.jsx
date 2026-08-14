import React, { useState, useEffect } from 'react';
import { useResumeBuilder } from '../ResumeBuilderContext';

export default function SummaryForm() {
  const { getSectionData, saveSection, nextStep, prevStep } = useResumeBuilder();
  const [data, setData] = useState({ text: '' });

  useEffect(() => {
    const existing = getSectionData('summary');
    if (existing) setData(existing);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveSection('summary', data, 'Professional Summary');
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Write a brief summary highlighting your professional background, key achievements, and career goals.
        </label>
        <textarea 
          value={data.text} 
          onChange={(e) => setData({ text: e.target.value })} 
          rows="6" 
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Experienced Software Engineer with a passion for building scalable web applications..."
        ></textarea>
      </div>
      
      <div className="flex justify-between pt-4">
        <button type="button" onClick={prevStep} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">Back</button>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">Save & Next</button>
      </div>
    </form>
  );
}
