import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  User, Briefcase, GraduationCap, Code, 
  Wrench, Award, Globe, Plus, AlignJustify,
  ChevronDown, ChevronUp, Trash2, LayoutTemplate
} from 'lucide-react';
import { Button } from '../ui/button';
import { 
  PersonalInfoForm, SummaryForm, ArraySectionForm, 
  ExperienceForm, EducationForm, SkillsForm, GenericItemForm 
} from './SectionForms';

export function StructurePanel() {
  const { activeSection, setActiveSection, resumeData, reorderSectionItem, removeSectionItem, addCustomSection, removeCustomSection } = useEditorStore();
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customLabel, setCustomLabel] = useState('');

  const handleAddCustom = () => {
    if (customLabel.trim()) {
      addCustomSection(customLabel.trim());
      setCustomLabel('');
      setIsAddingCustom(false);
    }
  };

  const sections = [
    { id: 'personalInfo', label: 'Personal Information', icon: User },
    { id: 'summary', label: 'Professional Summary', icon: AlignJustify },
    { id: 'experience', label: 'Work Experience', icon: Briefcase, isArray: true },
    { id: 'education', label: 'Education', icon: GraduationCap, isArray: true },
    { id: 'skills', label: 'Skills', icon: Wrench, isArray: true },
    { id: 'projects', label: 'Projects', icon: Code, isArray: true },
    { id: 'certifications', label: 'Certifications', icon: Award, isArray: true },
    { id: 'languages', label: 'Languages', icon: Globe, isArray: true },
    ...(resumeData.customSections || []).map(sec => ({
      id: sec.id,
      label: sec.label,
      icon: LayoutTemplate,
      isArray: true,
      isCustom: true
    }))
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-4 border-b shrink-0">
        <h2 className="font-semibold text-lg">Resume Structure</h2>
        <p className="text-sm text-muted-foreground">Select a section to edit.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const Icon = section.icon;
          
          return (
            <div key={section.id} className="space-y-1">
              <div className={`flex items-center justify-between p-1 rounded-md transition-colors ${isActive ? 'bg-primary/10' : 'hover:bg-accent'}`}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`flex-1 flex items-center gap-3 p-2 text-left ${isActive ? 'text-primary font-medium' : 'text-foreground'}`}
                >
                  <Icon className="w-5 h-5 opacity-70" />
                  <span>{section.label}</span>
                </button>
                {section.isCustom && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); removeCustomSection(section.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Render the appropriate form if active */}
              {isActive && (
                <div className="pl-11 pr-3 pb-3 pt-1 animate-in slide-in-from-top-2 duration-200">
                   {section.id === 'personalInfo' && <PersonalInfoForm />}
                   {section.id === 'summary' && <SummaryForm />}
                   
                   {section.id === 'experience' && (
                     <ArraySectionForm sectionId={section.id} defaultNewItem={{ company: '', position: '' }} renderItemForm={(item, id) => <ExperienceForm item={item} sectionId={id} />} />
                   )}
                   {section.id === 'education' && (
                     <ArraySectionForm sectionId={section.id} defaultNewItem={{ institution: '', degree: '' }} renderItemForm={(item, id) => <EducationForm item={item} sectionId={id} />} />
                   )}
                   {section.id === 'skills' && (
                     <ArraySectionForm sectionId={section.id} defaultNewItem={{ name: '', level: '' }} renderItemForm={(item, id) => <SkillsForm item={item} sectionId={id} />} />
                   )}
                   {(['projects', 'certifications', 'languages'].includes(section.id) || section.isCustom) && (
                     <ArraySectionForm sectionId={section.id} defaultNewItem={{ name: '' }} renderItemForm={(item, id) => <GenericItemForm item={item} sectionId={id} />} />
                   )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t bg-slate-50 shrink-0">
        {isAddingCustom ? (
          <div className="flex flex-col gap-2">
            <input 
              autoFocus
              type="text" 
              placeholder="Section Name (e.g. Publications)" 
              className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCustom();
                if (e.key === 'Escape') setIsAddingCustom(false);
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddCustom} className="flex-1">Add</Button>
              <Button size="sm" variant="outline" onClick={() => setIsAddingCustom(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full bg-white border-dashed" onClick={() => setIsAddingCustom(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Section
          </Button>
        )}
      </div>
    </div>
  );
}
