import React, { useState, useEffect } from 'react';
import { useResumeBuilder } from '../ResumeBuilderContext';

export default function SkillsForm() {
  const { getSectionData, saveSection, nextStep, prevStep } = useResumeBuilder();
  const [skills, setSkills] = useState('');

  useEffect(() => {
    const existing = getSectionData('skills');
    if (existing && existing.items) {
      setSkills(existing.items.join(', '));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    await saveSection('skills', { items: skillsArray }, 'Skills');
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          List your skills separated by commas (e.g. JavaScript, React, Python, Django, Project Management)
        </label>
        <textarea 
          value={skills} 
          onChange={(e) => setSkills(e.target.value)} 
          rows="5" 
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="JavaScript, Python, React..."
        ></textarea>
      </div>
      
      <div className="flex justify-between pt-4">
        <button type="button" onClick={prevStep} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">Back</button>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">Save & Next</button>
      </div>
    </form>
  );
}
