import React, { useState, useEffect } from 'react';
import { useResumeBuilder } from '../ResumeBuilderContext';
import { Plus, Trash2 } from 'lucide-react';

export default function AwardsForm() {
  const { getSectionData, saveSection, nextStep, prevStep } = useResumeBuilder();
  const [awards, setAwards] = useState([]);

  useEffect(() => {
    const existing = getSectionData('awards');
    if (existing && Array.isArray(existing.items)) {
      setAwards(existing.items);
    }
  }, []);

  const addAward = () => {
    setAwards([...awards, { title: '', issuer: '', date: '', description: '' }]);
  };

  const removeAward = (index) => {
    const newAwards = [...awards];
    newAwards.splice(index, 1);
    setAwards(newAwards);
  };

  const handleChange = (index, field, value) => {
    const newAwards = [...awards];
    newAwards[index][field] = value;
    setAwards(newAwards);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveSection('awards', { items: awards }, 'Awards');
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {awards.map((item, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-md relative bg-gray-50">
          <button type="button" onClick={() => removeAward(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
            <Trash2 size={18} />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Award Title</label>
              <input type="text" value={item.title} onChange={(e) => handleChange(index, 'title', e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
              <input type="text" value={item.issuer} onChange={(e) => handleChange(index, 'issuer', e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="month" value={item.date} onChange={(e) => handleChange(index, 'date', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea value={item.description} onChange={(e) => handleChange(index, 'description', e.target.value)} rows="2" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={addAward} className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition">
        <Plus size={18} className="mr-1" /> Add Award
      </button>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button type="button" onClick={prevStep} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">Back</button>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">Save & Next</button>
      </div>
    </form>
  );
}
