import React, { useState, useEffect } from 'react';
import { useResumeBuilder } from '../ResumeBuilderContext';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CustomSectionsForm() {
  const { getSectionData, saveSection, prevStep } = useResumeBuilder();
  const [sections, setSections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const existing = getSectionData('custom');
    if (existing && Array.isArray(existing.items)) {
      setSections(existing.items);
    }
  }, []);

  const addSection = () => {
    setSections([...sections, { heading: '', content: '' }]);
  };

  const removeSection = (index) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };

  const handleChange = (index, field, value) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveSection('custom', { items: sections }, 'Custom Sections');
    // Finish wizard
    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {sections.map((sec, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-md relative bg-gray-50">
          <button type="button" onClick={() => removeSection(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
            <Trash2 size={18} />
          </button>
          
          <div className="grid grid-cols-1 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Heading</label>
              <input type="text" value={sec.heading} onChange={(e) => handleChange(index, 'heading', e.target.value)} required placeholder="e.g. Publications" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea value={sec.content} onChange={(e) => handleChange(index, 'content', e.target.value)} rows="5" required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={addSection} className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition">
        <Plus size={18} className="mr-1" /> Add Custom Section
      </button>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button type="button" onClick={prevStep} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">Back</button>
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition">Complete Resume</button>
      </div>
    </form>
  );
}
