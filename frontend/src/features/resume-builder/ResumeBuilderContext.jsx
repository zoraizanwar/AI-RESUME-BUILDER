import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ResumeBuilderContext = createContext();

export const useResumeBuilder = () => useContext(ResumeBuilderContext);

export const ResumeBuilderProvider = ({ children }) => {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [version, setVersion] = useState(null);
  const [sections, setSections] = useState([]);
  
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const STEPS = [
    { id: 'personal', title: 'Personal Info' },
    { id: 'summary', title: 'Summary' },
    { id: 'experience', title: 'Experience' },
    { id: 'education', title: 'Education' },
    { id: 'projects', title: 'Projects' },
    { id: 'skills', title: 'Skills' },
    { id: 'certifications', title: 'Certifications' },
    { id: 'awards', title: 'Awards' },
    { id: 'languages', title: 'Languages' },
    { id: 'volunteer', title: 'Volunteer' },
    { id: 'custom', title: 'Custom Sections' }
  ];

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Resume
      const resResume = await api.get(`/resumes/${resumeId}/`);
      setResume(resResume.data);
      
      // 2. Fetch or Create Base Version
      const resVersions = await api.get(`/versions/?resume=${resumeId}`);
      let currentVersion = resVersions.data.find(v => v.is_base) || resVersions.data[0];
      
      if (!currentVersion) {
        const createVer = await api.post('/versions/', {
          resume: resumeId,
          version_name: 'Base Version',
          is_base: true
        });
        currentVersion = createVer.data;
      }
      setVersion(currentVersion);

      // 3. Set sections
      setSections(currentVersion.sections || []);

    } catch (err) {
      console.error("Failed to load resume data", err);
      setError("Failed to load resume data");
    } finally {
      setIsLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    if (resumeId) {
      loadData();
    }
  }, [resumeId, loadData]);

  const changeVersion = async (versionId) => {
    setIsLoading(true);
    try {
      const resVersions = await api.get(`/versions/?resume=${resumeId}`);
      const selected = resVersions.data.find(v => v.id === versionId);
      if (selected) {
        setVersion(selected);
        setSections(selected.sections || []);
      }
    } catch (err) {
      console.error("Failed to change version", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSection = async (sectionType, content, title = "") => {
    setIsSaving(true);
    try {
      const existingSection = sections.find(s => s.section_type === sectionType);
      if (existingSection) {
        const res = await api.put(`/sections/${existingSection.id}/`, {
          version: version.id,
          section_type: sectionType,
          title: title || existingSection.title,
          content: content,
          order: existingSection.order
        });
        setSections(sections.map(s => s.id === existingSection.id ? res.data : s));
      } else {
        const order = sections.length;
        const res = await api.post('/sections/', {
          version: version.id,
          section_type: sectionType,
          title: title || sectionType,
          content: content,
          order: order
        });
        setSections([...sections, res.data]);
      }
    } catch (err) {
      console.error("Failed to save section", err);
      setError("Failed to save section. Please try again.");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const getSectionData = (sectionType) => {
    const s = sections.find(s => s.section_type === sectionType);
    return s ? s.content : null;
  };

  const nextStep = () => {
    if (activeStep < STEPS.length - 1) setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  return (
    <ResumeBuilderContext.Provider value={{
      resume, version, sections, STEPS, activeStep, setActiveStep,
      isLoading, isSaving, error, setError,
      saveSection, getSectionData, nextStep, prevStep, loadData, changeVersion
    }}>
      {children}
    </ResumeBuilderContext.Provider>
  );
};
