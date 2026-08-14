import React, { useState, useEffect } from 'react';
import { useResumeBuilder } from '../ResumeBuilderContext';
import { Plus, Trash2 } from 'lucide-react';

export default function CertificationsForm() {
  const { getSectionData, saveSection, nextStep, prevStep } = useResumeBuilder();
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    const existing = getSectionData('certifications');
    if (existing && Array.isArray(existing.items)) {
      setCerts(existing.items);
    }
  }, []);

  const addCert = () => {
    setCerts([...certs, { title: '', issuer: '', date: '', url: '' }]);
  };

  const removeCert = (index) => {
    const newCerts = [...certs];
    newCerts.splice(index, 1);
    setCerts(newCerts);
  };

  const handleChange = (index, field, value) => {
    const newCerts = [...certs];
    newCerts[index][field] = value;
    setCerts(newCerts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveSection('certifications', { items: certs }, 'Certifications');
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {certs.map((item, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-md relative bg-gray-50">
          <button type="button" onClick={() => removeCert(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
            <Trash2 size={18} />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
              <input type="text" value={item.title} onChange={(e) => handleChange(index, 'title', e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
              <input type="text" value={item.issuer} onChange={(e) => handleChange(index, 'issuer', e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
              <input type="month" value={item.date} onChange={(e) => handleChange(index, 'date', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credential URL (Optional)</label>
              <input type="url" value={item.url} onChange={(e) => handleChange(index, 'url', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={addCert} className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition">
        <Plus size={18} className="mr-1" /> Add Certification
      </button>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button type="button" onClick={prevStep} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">Back</button>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">Save & Next</button>
      </div>
    </form>
  );
}
