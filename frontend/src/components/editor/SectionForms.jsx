import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Button } from '../ui/button';
import { Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';

export function PersonalInfoForm() {
  const { resumeData, updatePersonalInfo } = useEditorStore();
  const data = resumeData.personalInfo || {};

  const handleChange = (e) => {
    updatePersonalInfo(e.target.name, e.target.value);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input name="firstName" value={data.firstName || ''} onChange={handleChange} placeholder="First Name" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        <input name="lastName" value={data.lastName || ''} onChange={handleChange} placeholder="Last Name" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>
      <input name="email" type="email" value={data.email || ''} onChange={handleChange} placeholder="Email" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      <input name="phone" value={data.phone || ''} onChange={handleChange} placeholder="Phone" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      <input name="location" value={data.location || ''} onChange={handleChange} placeholder="Location (City, State)" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      <input name="linkedin" value={data.linkedin || ''} onChange={handleChange} placeholder="LinkedIn URL" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      <input name="website" value={data.website || ''} onChange={handleChange} placeholder="Website/Portfolio URL" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      <input name="photoUrl" value={data.photoUrl || ''} onChange={handleChange} placeholder="Profile Photo URL (for Creative Template)" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
    </div>
  );
}

export function SummaryForm() {
  const { resumeData, updatePersonalInfo } = useEditorStore();
  
  return (
    <textarea 
      value={resumeData.personalInfo?.summary || ''} 
      onChange={(e) => updatePersonalInfo('summary', e.target.value)} 
      placeholder="Brief professional summary..." 
      className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y" 
    />
  );
}

export function ArraySectionForm({ sectionId, renderItemForm, defaultNewItem }) {
  const { resumeData, addSectionItem, removeSectionItem, reorderSectionItem } = useEditorStore();
  const items = resumeData[sectionId] || [];

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="relative p-3 bg-slate-50 border rounded-lg space-y-3">
          <div className="absolute top-2 right-2 flex items-center space-x-1">
            <button onClick={() => reorderSectionItem(sectionId, item.id, 'up')} disabled={index === 0} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"><ChevronUp className="w-4 h-4"/></button>
            <button onClick={() => reorderSectionItem(sectionId, item.id, 'down')} disabled={index === items.length - 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"><ChevronDown className="w-4 h-4"/></button>
            <button onClick={() => removeSectionItem(sectionId, item.id)} className="p-1 text-rose-400 hover:text-rose-600"><Trash2 className="w-4 h-4"/></button>
          </div>
          {renderItemForm(item, sectionId)}
        </div>
      ))}
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full border-dashed"
        onClick={() => {
          const newItem = { id: Date.now().toString(), ...defaultNewItem };
          addSectionItem(sectionId, newItem);
        }}
      >
        <Plus className="w-4 h-4 mr-2" /> Add Item
      </Button>
    </div>
  );
}

export function ExperienceForm({ item, sectionId }) {
  const { updateSectionItem } = useEditorStore();
  const handleChange = (e) => updateSectionItem(sectionId, item.id, e.target.name, e.target.value);
  
  return (
    <div className="space-y-2 mt-4 pr-12">
      <input name="company" value={item.company || ''} onChange={handleChange} placeholder="Company" className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm" />
      <input name="position" value={item.position || ''} onChange={handleChange} placeholder="Position Title" className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input name="startDate" value={item.startDate || ''} onChange={handleChange} placeholder="Start Date" className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm" />
        <input name="endDate" value={item.endDate || ''} onChange={handleChange} placeholder="End Date" className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm" />
      </div>
      <textarea name="description" value={item.description || ''} onChange={handleChange} placeholder="Description" className="flex min-h-[80px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm resize-y" />
    </div>
  );
}

export function EducationForm({ item, sectionId }) {
  const { updateSectionItem } = useEditorStore();
  const handleChange = (e) => updateSectionItem(sectionId, item.id, e.target.name, e.target.value);
  
  return (
    <div className="space-y-2 mt-4 pr-12">
      <input name="institution" value={item.institution || ''} onChange={handleChange} placeholder="Institution" className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm" />
      <input name="degree" value={item.degree || ''} onChange={handleChange} placeholder="Degree" className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm" />
      <input name="fieldOfStudy" value={item.fieldOfStudy || ''} onChange={handleChange} placeholder="Field of Study" className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input name="startDate" value={item.startDate || ''} onChange={handleChange} placeholder="Start Date" className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm" />
        <input name="endDate" value={item.endDate || ''} onChange={handleChange} placeholder="End Date" className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm" />
      </div>
    </div>
  );
}

export function SkillsForm({ item, sectionId }) {
  const { updateSectionItem } = useEditorStore();
  const handleChange = (e) => updateSectionItem(sectionId, item.id, e.target.name, e.target.value);
  
  return (
    <div className="flex gap-2 mt-4 pr-12">
      <input name="name" value={item.name || ''} onChange={handleChange} placeholder="Skill (e.g. JavaScript)" className="flex h-9 flex-1 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm" />
      <input name="level" value={item.level || ''} onChange={handleChange} placeholder="Level (optional)" className="flex h-9 w-1/3 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm" />
    </div>
  );
}

export function GenericItemForm({ item, sectionId }) {
  const { updateSectionItem } = useEditorStore();
  const handleChange = (e) => updateSectionItem(sectionId, item.id, e.target.name, e.target.value);
  
  return (
    <div className="space-y-2 mt-4 pr-12">
      <input name="title" value={item.title || item.name || ''} onChange={(e) => updateSectionItem(sectionId, item.id, item.title !== undefined ? 'title' : 'name', e.target.value)} placeholder="Title / Name" className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm" />
      <textarea name="description" value={item.description || ''} onChange={handleChange} placeholder="Description (optional)" className="flex min-h-[60px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm resize-y" />
    </div>
  );
}
