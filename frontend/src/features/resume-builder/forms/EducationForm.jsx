import React, { useState, useEffect } from 'react';
import { useResumeBuilder } from '../ResumeBuilderContext';
import { Plus, Trash2 } from 'lucide-react';

export default function EducationForm() {
  const { getSectionData, saveSection, nextStep, prevStep } = useResumeBuilder();
  const [edu, setEdu] = useState([]);

  useEffect(() => {
    const existing = getSectionData('education');
    if (existing && Array.isArray(existing.items)) {
      setEdu(existing.items);
    }
  }, []);

  const addEdu = () => {
    setEdu([...edu, { school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' }]);
  };

  const removeEdu = (index) => {
    const newEdu = [...edu];
    newEdu.splice(index, 1);
    setEdu(newEdu);
  };

  const handleChange = (index, field, value) => {
    const newEdu = [...edu];
    newEdu[index][field] = value;
    setEdu(newEdu);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveSection('education', { items: edu }, 'Education');
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {edu.map((item, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-md relative bg-gray-50">
          <button type="button" onClick={() => removeEdu(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
            <Trash2 size={18} />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
              <input type="text" value={item.school} onChange={(e) => handleChange(index, 'school', e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
              <input type="text" value={item.degree} onChange={(e) => handleChange(index, 'degree', e.target.value)} required placeholder="e.g. Bachelor of Science" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
              <input type="text" value={item.fieldOfStudy} onChange={(e) => handleChange(index, 'fieldOfStudy', e.target.value)} required placeholder="e.g. Computer Science" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="month" value={item.startDate} onChange={(e) => handleChange(index, 'startDate', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (or Expected)</label>
              <input type="month" value={item.endDate} onChange={(e) => handleChange(index, 'endDate', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={addEdu} className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition">
        <Plus size={18} className="mr-1" /> Add Education
      </button>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button type="button" onClick={prevStep} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">Back</button>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">Save & Next</button>
      </div>
    </form>
  );
}
