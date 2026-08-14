import React, { useState, useEffect } from 'react';
import { useResumeBuilder } from '../ResumeBuilderContext';
import { Plus, Trash2 } from 'lucide-react';

export default function LanguagesForm() {
  const { getSectionData, saveSection, nextStep, prevStep } = useResumeBuilder();
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const existing = getSectionData('languages');
    if (existing && Array.isArray(existing.items)) {
      setLanguages(existing.items);
    }
  }, []);

  const addLanguage = () => {
    setLanguages([...languages, { name: '', proficiency: 'Native' }]);
  };

  const removeLanguage = (index) => {
    const newLangs = [...languages];
    newLangs.splice(index, 1);
    setLanguages(newLangs);
  };

  const handleChange = (index, field, value) => {
    const newLangs = [...languages];
    newLangs[index][field] = value;
    setLanguages(newLangs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveSection('languages', { items: languages }, 'Languages');
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {languages.map((item, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-md relative bg-gray-50 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <input type="text" value={item.name} onChange={(e) => handleChange(index, 'name', e.target.value)} required placeholder="e.g. English" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency</label>
            <select value={item.proficiency} onChange={(e) => handleChange(index, 'proficiency', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white">
              <option value="Native">Native</option>
              <option value="Fluent">Fluent</option>
              <option value="Conversational">Conversational</option>
              <option value="Basic">Basic</option>
            </select>
          </div>
          <button type="button" onClick={() => removeLanguage(index)} className="p-2 text-red-500 hover:text-red-700 mb-1">
            <Trash2 size={20} />
          </button>
        </div>
      ))}

      <button type="button" onClick={addLanguage} className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition">
        <Plus size={18} className="mr-1" /> Add Language
      </button>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button type="button" onClick={prevStep} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">Back</button>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">Save & Next</button>
      </div>
    </form>
  );
}
