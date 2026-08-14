import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { EditorTopBar } from '../components/editor/EditorTopBar';
import { StructurePanel } from '../components/editor/StructurePanel';
import { PreviewPanel } from '../components/editor/PreviewPanel';
import { AIAssistantPanel } from '../components/editor/AIAssistantPanel';
import api from '../services/api';
import { useEditorStore } from '../store/useEditorStore';
import { Loader2 } from 'lucide-react';

export function ResumeEditor() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { resumeData, setResumeData, setTemplate } = useEditorStore();
  const [loading, setLoading] = useState(true);
  const [resumeTitle, setResumeTitle] = useState('Loading...');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [versionId, setVersionId] = useState(null);

  useEffect(() => {
    if (location.state?.templateLayout) {
      setTemplate(location.state.templateLayout);
    }
  }, [location.state, setTemplate]);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        if (location.state?.tailoredData) {
          // If we have tailoredData from the Job Matcher, map it to the store.
          const td = location.state.tailoredData;
          const mappedData = {
            personalInfo: {
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              location: '',
              linkedin: '',
              website: '',
              photoUrl: '',
              summary: ''
            },
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            languages: [],
            customSections: [],
          };

          td.tailored_sections.forEach(sec => {
            const type = sec.section_type.toLowerCase();
            if (type === 'summary') {
              mappedData.personalInfo.summary = typeof sec.content === 'string' ? sec.content : (sec.content.summary || sec.content.text || '');
            } else if (type === 'personal') {
              mappedData.personalInfo.firstName = sec.content.first_name || '';
              mappedData.personalInfo.lastName = sec.content.last_name || '';
              mappedData.personalInfo.email = sec.content.email || '';
              mappedData.personalInfo.phone = sec.content.phone || '';
              mappedData.personalInfo.location = sec.content.location || '';
              mappedData.personalInfo.linkedin = sec.content.linkedin || '';
              mappedData.personalInfo.website = sec.content.website || '';
              mappedData.personalInfo.photoUrl = sec.content.photo_url || '';
            } else if (type === 'experience') {
              mappedData.experience = Array.isArray(sec.content) ? sec.content : (sec.content.items || []);
            } else if (type === 'education') {
              mappedData.education = Array.isArray(sec.content) ? sec.content : (sec.content.items || []);
            } else if (type === 'skills') {
              mappedData.skills = Array.isArray(sec.content) ? sec.content.map(s => typeof s === 'string' ? { name: s } : s) : (sec.content.items || []);
            } else if (type === 'projects') {
              mappedData.projects = Array.isArray(sec.content) ? sec.content : (sec.content.items || []);
            } else if (type === 'certifications') {
              mappedData.certifications = Array.isArray(sec.content) ? sec.content.map(c => typeof c === 'string' ? { name: c } : c) : (sec.content.items || []);
            } else if (type === 'languages') {
              mappedData.languages = Array.isArray(sec.content) ? sec.content.map(l => typeof l === 'string' ? { name: l } : l) : (sec.content.items || []);
            }
          });

          setResumeData(mappedData);
          setResumeTitle('Tailored Resume');
          setLoading(false);
          return;
        }

        if (id === 'new') {
           setResumeTitle('New Resume');
           setLoading(false);
           return;
        }

        const res = await api.get(`/resumes/${id}/`);
        setResumeTitle(res.data.title);
        
        // Fetch base version and its sections
        const resVersions = await api.get(`/versions/?resume=${id}`);
        let activeVersion = resVersions.data.find(v => v.is_base) || resVersions.data[0];
        
        if (!activeVersion) {
          const createVer = await api.post('/versions/', {
            resume: id,
            version_name: 'Base Version',
            is_base: true
          });
          activeVersion = createVer.data;
        }
        
        setVersionId(activeVersion.id);

        // Map backend sections to Zustand store
        const sections = activeVersion.sections || [];
        const mappedData = {
          personalInfo: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            website: '',
            photoUrl: '',
            summary: ''
          },
          experience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
          languages: [],
          customSections: [],
        };

        // Find personal section
        const personalSec = sections.find(s => s.section_type === 'personal');
        if (personalSec) {
          const c = personalSec.content;
          mappedData.personalInfo.firstName = c.first_name || '';
          mappedData.personalInfo.lastName = c.last_name || '';
          mappedData.personalInfo.email = c.email || '';
          mappedData.personalInfo.phone = c.phone || '';
          mappedData.personalInfo.location = c.location || '';
          mappedData.personalInfo.linkedin = c.linkedin || '';
          mappedData.personalInfo.website = c.website || '';
          mappedData.personalInfo.photoUrl = c.photo_url || '';
        }

        // Find summary section
        const summarySec = sections.find(s => s.section_type === 'summary');
        if (summarySec) {
          mappedData.personalInfo.summary = summarySec.content.text || '';
        }

        // Standard array mapping helper
        const getSortedItems = (secType) => {
          return sections
            .filter(s => s.section_type === secType)
            .sort((a, b) => a.order - b.order);
        };

        // Experience
        mappedData.experience = getSortedItems('experience').map(s => ({
          id: s.id.toString(),
          company: s.content.company_name || '',
          position: s.content.job_title || '',
          startDate: s.content.start_date || '',
          endDate: s.content.end_date || '',
          description: s.content.description || ''
        }));

        // Education
        mappedData.education = getSortedItems('education').map(s => ({
          id: s.id.toString(),
          institution: s.content.school_name || '',
          degree: s.content.degree || '',
          fieldOfStudy: s.content.field || '',
          startDate: s.content.start_date || '',
          endDate: s.content.end_date || ''
        }));

        // Skills
        mappedData.skills = getSortedItems('skills').map(s => ({
          id: s.id.toString(),
          name: s.content.name || ''
        }));

        // Projects
        mappedData.projects = getSortedItems('projects').map(s => ({
          id: s.id.toString(),
          name: s.content.name || '',
          description: s.content.description || ''
        }));

        // Certifications
        mappedData.certifications = getSortedItems('certifications').map(s => ({
          id: s.id.toString(),
          name: s.content.name || ''
        }));

        // Languages
        mappedData.languages = getSortedItems('languages').map(s => ({
          id: s.id.toString(),
          name: s.content.name || ''
        }));

        // Custom Sections
        const customSecs = getSortedItems('custom');
        customSecs.forEach(s => {
          const c = s.content;
          if (c.id && c.label) {
            mappedData.customSections.push({ id: c.id, label: c.label });
            mappedData[c.id] = c.items || [];
          }
        });

        setResumeData(mappedData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch resume", err);
        setSaveStatus('error');
        setLoading(false);
      }
    };
    fetchResume();
  }, [id, location.state, setResumeData]);

  const isInitialLoad = useRef(true);

  // Mark save status as unsaved when resume data or title changes after loading
  useEffect(() => {
    if (loading) {
      isInitialLoad.current = true;
      return;
    }
    
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    
    setSaveStatus('unsaved');
  }, [resumeData, resumeTitle, loading]);

  const handleSaveResume = async () => {
    setSaveStatus('saving');
    try {
      let currentResumeId = id;
      let currentVersionId = versionId;

      // 1. If new, create resume
      if (currentResumeId === 'new') {
        const resResume = await api.post('/resumes/', {
          title: resumeTitle === 'New Resume' ? 'Untitled Resume' : resumeTitle
        });
        currentResumeId = resResume.data.id;
        
        const resVersion = await api.post('/versions/', {
          resume: currentResumeId,
          version_name: 'Base Version',
          is_base: true
        });
        currentVersionId = resVersion.data.id;
        setVersionId(currentVersionId);
      } else {
        // Update the title of the existing resume
        await api.patch(`/resumes/${currentResumeId}/`, {
          title: resumeTitle
        });
      }

      // 2. Fetch version if missing
      if (!currentVersionId) {
        const resVersions = await api.get(`/versions/?resume=${currentResumeId}`);
        let activeVersion = resVersions.data.find(v => v.is_base) || resVersions.data[0];
        if (!activeVersion) {
          const createVer = await api.post('/versions/', {
            resume: currentResumeId,
            version_name: 'Base Version',
            is_base: true
          });
          activeVersion = createVer.data;
        }
        currentVersionId = activeVersion.id;
        setVersionId(currentVersionId);
      }

      // 3. Clear existing sections for this version to refresh the DB representation
      const existingSectionsRes = await api.get(`/sections/?version=${currentVersionId}`);
      const deletePromises = existingSectionsRes.data.map(sec => api.delete(`/sections/${sec.id}/`));
      await Promise.all(deletePromises);

      // Now create all new sections
      const sectionsToCreate = [];

      // A. Personal
      sectionsToCreate.push({
        version: currentVersionId,
        section_type: 'personal',
        title: 'Personal Information',
        content: {
          first_name: resumeData.personalInfo.firstName || '',
          last_name: resumeData.personalInfo.lastName || '',
          email: resumeData.personalInfo.email || '',
          phone: resumeData.personalInfo.phone || '',
          location: resumeData.personalInfo.location || '',
          linkedin: resumeData.personalInfo.linkedin || '',
          website: resumeData.personalInfo.website || '',
          photo_url: resumeData.personalInfo.photoUrl || ''
        },
        order: 0
      });

      // B. Summary
      if (resumeData.personalInfo.summary) {
        sectionsToCreate.push({
          version: currentVersionId,
          section_type: 'summary',
          title: 'Professional Summary',
          content: { text: resumeData.personalInfo.summary },
          order: 1
        });
      }

      let orderIdx = 2;

      // C. Experience
      (resumeData.experience || []).forEach(item => {
        sectionsToCreate.push({
          version: currentVersionId,
          section_type: 'experience',
          title: 'Work Experience',
          content: {
            company_name: item.company || '',
            job_title: item.position || '',
            start_date: item.startDate || '',
            end_date: item.endDate || 'Present',
            description: item.description || ''
          },
          order: orderIdx++
        });
      });

      // D. Education
      (resumeData.education || []).forEach(item => {
        sectionsToCreate.push({
          version: currentVersionId,
          section_type: 'education',
          title: 'Education',
          content: {
            school_name: item.institution || '',
            degree: item.degree || '',
            field: item.fieldOfStudy || '',
            start_date: item.startDate || '',
            end_date: item.endDate || 'Present'
          },
          order: orderIdx++
        });
      });

      // E. Skills
      (resumeData.skills || []).forEach(item => {
        sectionsToCreate.push({
          version: currentVersionId,
          section_type: 'skills',
          title: 'Skills',
          content: { name: item.name || '' },
          order: orderIdx++
        });
      });

      // F. Projects
      (resumeData.projects || []).forEach(item => {
        sectionsToCreate.push({
          version: currentVersionId,
          section_type: 'projects',
          title: 'Projects',
          content: {
            name: item.name || '',
            description: item.description || ''
          },
          order: orderIdx++
        });
      });

      // G. Certifications
      (resumeData.certifications || []).forEach(item => {
        sectionsToCreate.push({
          version: currentVersionId,
          section_type: 'certifications',
          title: 'Certifications',
          content: { name: item.name || '' },
          order: orderIdx++
        });
      });

      // H. Languages
      (resumeData.languages || []).forEach(item => {
        sectionsToCreate.push({
          version: currentVersionId,
          section_type: 'languages',
          title: 'Languages',
          content: { name: item.name || '' },
          order: orderIdx++
        });
      });

      // I. Custom
      (resumeData.customSections || []).forEach(sec => {
        sectionsToCreate.push({
          version: currentVersionId,
          section_type: 'custom',
          title: sec.label,
          content: {
            id: sec.id,
            label: sec.label,
            items: resumeData[sec.id] || []
          },
          order: orderIdx++
        });
      });

      const createPromises = sectionsToCreate.map(sec => api.post('/sections/', sec));
      await Promise.all(createPromises);

      if (id === 'new') {
        navigate(`/app/resumes/${currentResumeId}/edit`, { replace: true });
      }

      setSaveStatus('saved');
    } catch (err) {
      console.error("Failed to save resume", err);
      setSaveStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 animate-in fade-in duration-300">
      <EditorTopBar resumeTitle={resumeTitle} saveStatus={saveStatus} onSave={handleSaveResume} onTitleChange={setResumeTitle} />
      
      {/* Main 3-panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Structure Editor */}
        <div className="hidden lg:block w-[350px] shrink-0 z-10 bg-white shadow-sm border-r relative">
           <StructurePanel />
        </div>
        
        {/* Center Panel: Live Preview */}
        <div className="flex-1 min-w-0 z-0">
           <PreviewPanel />
        </div>
        
        {/* Right Panel: AI Assistant */}
        <div className="hidden xl:block w-[320px] shrink-0 z-10 bg-white shadow-sm border-l relative">
           <AIAssistantPanel />
        </div>

      </div>
    </div>
  );
}
