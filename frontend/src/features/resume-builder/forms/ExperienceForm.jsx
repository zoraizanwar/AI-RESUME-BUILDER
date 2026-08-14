import React, { useState, useEffect } from 'react';
import { useResumeBuilder } from '../ResumeBuilderContext';
import { Plus, Trash2 } from 'lucide-react';

export default function ExperienceForm() {
  const { getSectionData, saveSection, nextStep, prevStep } = useResumeBuilder();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const existing = getSectionData('experience');
    if (existing && Array.isArray(existing.items)) {
      setJobs(existing.items);
    }
  }, []);

  const addJob = () => {
    setJobs([...jobs, { company: '', position: '', startDate: '', endDate: '', description: '' }]);
  };

  const removeJob = (index) => {
    const newJobs = [...jobs];
    newJobs.splice(index, 1);
    setJobs(newJobs);
  };

  const handleChange = (index, field, value) => {
    const newJobs = [...jobs];
    newJobs[index][field] = value;
    setJobs(newJobs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveSection('experience', { items: jobs }, 'Experience');
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {jobs.map((job, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-md relative bg-gray-50">
          <button type="button" onClick={() => removeJob(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
            <Trash2 size={18} />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" value={job.company} onChange={(e) => handleChange(index, 'company', e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input type="text" value={job.position} onChange={(e) => handleChange(index, 'position', e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="month" value={job.startDate} onChange={(e) => handleChange(index, 'startDate', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (or Expected)</label>
              <input type="month" value={job.endDate} onChange={(e) => handleChange(index, 'endDate', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={job.description} onChange={(e) => handleChange(index, 'description', e.target.value)} rows="4" placeholder="Describe your responsibilities and achievements..." className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={addJob} className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition">
        <Plus size={18} className="mr-1" /> Add Experience
      </button>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button type="button" onClick={prevStep} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">Back</button>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">Save & Next</button>
      </div>
    </form>
  );
}
