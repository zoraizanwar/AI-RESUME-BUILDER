import { create } from 'zustand';

export const useEditorStore = create((set) => ({
  // Core state
  resumeData: {
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    customSections: [], // { id, label }
  },
  
  // UI State
  activeSection: 'personalInfo', // ID of the currently active section in left panel
  activeTab: 'edit', // 'edit', 'preview', 'ai' (for mobile)
  zoomLevel: 100, // percentage
  activeTemplate: 'modern', // 'modern', 'classic', 'minimal'
  
  // Actions
  setResumeData: (data) => set({ resumeData: data }),
  setTemplate: (templateId) => set({ activeTemplate: templateId }),
  
  updatePersonalInfo: (field, value) => set((state) => ({
    resumeData: {
      ...state.resumeData,
      personalInfo: {
        ...state.resumeData.personalInfo,
        [field]: value
      }
    }
  })),

  // Generic array update for sections like experience/education
  updateSectionItem: (section, id, field, value) => set((state) => ({
    resumeData: {
      ...state.resumeData,
      [section]: state.resumeData[section].map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }
  })),

  addSectionItem: (section, item) => set((state) => ({
    resumeData: {
      ...state.resumeData,
      [section]: [...state.resumeData[section], item]
    }
  })),

  removeSectionItem: (section, id) => set((state) => ({
    resumeData: {
      ...state.resumeData,
      [section]: state.resumeData[section].filter(item => item.id !== id)
    }
  })),

  addCustomSection: (label) => set((state) => {
    const id = 'custom_' + Date.now();
    return {
      resumeData: {
        ...state.resumeData,
        customSections: [...(state.resumeData.customSections || []), { id, label }],
        [id]: [] // Initialize empty array for the items
      },
      activeSection: id
    };
  }),

  removeCustomSection: (id) => set((state) => {
    const { [id]: removedItems, customSections, ...restResumeData } = state.resumeData;
    return {
      resumeData: {
        ...restResumeData,
        customSections: customSections.filter(sec => sec.id !== id)
      },
      activeSection: state.activeSection === id ? 'personalInfo' : state.activeSection
    };
  }),

  reorderSectionItem: (section, id, direction) => set((state) => {
    const items = [...state.resumeData[section]];
    const index = items.findIndex(item => item.id === id);
    if (index < 0) return state;
    
    if (direction === 'up' && index > 0) {
      [items[index - 1], items[index]] = [items[index], items[index - 1]];
    } else if (direction === 'down' && index < items.length - 1) {
      [items[index + 1], items[index]] = [items[index], items[index + 1]];
    }
    
    return {
      resumeData: {
        ...state.resumeData,
        [section]: items
      }
    };
  }),

  // UI Actions
  setActiveSection: (section) => set({ activeSection: section }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setZoom: (level) => set({ zoomLevel: Math.max(50, Math.min(200, level)) }), // Clamp between 50% and 200%
}));
