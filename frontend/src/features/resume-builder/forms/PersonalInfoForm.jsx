import React, { useState, useEffect } from 'react';
import { useResumeBuilder } from '../ResumeBuilderContext';

export default function PersonalInfoForm() {
  const { getSectionData, saveSection, nextStep } = useResumeBuilder();
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: ''
  });

  useEffect(() => {
    const existing = getSectionData('personal');
    if (existing) setData(existing);
  }, []);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveSection('personal', data, 'Personal Information');
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input type="text" name="firstName" value={data.firstName} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input type="text" name="lastName" value={data.lastName} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" name="email" value={data.email} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input type="tel" name="phone" value={data.phone} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input type="text" name="location" value={data.location} onChange={handleChange} placeholder="City, State" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile (Optional)</label>
          <input type="url" name="linkedin" value={data.linkedin} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Personal Website (Optional)</label>
          <input type="url" name="website" value={data.website} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">Save & Next</button>
      </div>
    </form>
  );
}
