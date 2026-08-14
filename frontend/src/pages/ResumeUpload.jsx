import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, FileText, CheckCircle2, AlertCircle, 
  Loader2, ArrowRight, User, Briefcase, GraduationCap, 
  Code, Award, FileBadge
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import api from '../services/api';

const mapBackendExtractedDataToFrontend = (data) => {
  const p = data.personal_info || {};
  return {
    personal: {
      fullName: p.name || '',
      email: p.email || '',
      phone: p.phone || '',
      location: p.location || '',
      linkedin: p.linkedin || '',
      website: p.website || ''
    },
    summary: data.summary || '',
    experience: (data.experience || []).map((exp, i) => ({
      id: i + 1,
      title: exp.title || '',
      company: exp.company || '',
      date: exp.start_date && exp.end_date ? `${exp.start_date} - ${exp.end_date}` : exp.start_date || exp.end_date || 'Present',
      description: exp.description || ''
    })),
    education: (data.education || []).map((edu, i) => ({
      id: i + 1,
      degree: edu.degree || '',
      school: edu.institution || '',
      date: edu.start_date && edu.end_date ? `${edu.start_date} - ${edu.end_date}` : edu.start_date || edu.end_date || ''
    })),
    skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || ''),
  };
};

export function ResumeUpload() {
  const navigate = useNavigate();
  const [step, setStep] = useState('upload'); // 'upload' | 'processing' | 'review'
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Mock Extracted Data initially, overwritten by real upload
  const [extractedData, setExtractedData] = useState({
    personal: { fullName: '', email: '', phone: '', location: '', linkedin: '', website: '' },
    summary: '',
    experience: [],
    education: [],
    skills: '',
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (selectedFile) => {
    setError(null);
    if (!selectedFile) return false;
    
    // Accept standard PDF and DOCX mime types
    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/msword',
      '' // some systems don't resolve docx type correctly, rely on extension check in fallback
    ];
    const isDocxExt = selectedFile.name.toLowerCase().endsWith('.docx') || selectedFile.name.toLowerCase().endsWith('.doc') || selectedFile.name.toLowerCase().endsWith('.pdf');
    if (!validTypes.includes(selectedFile.type) && !isDocxExt) {
      setError("Please upload a valid PDF or DOCX file.");
      return false;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      setError("File is too large. Please upload a file smaller than 5MB.");
      return false;
    }
    
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
      handleRealUpload(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      handleRealUpload(selectedFile);
    }
  };

  const handleRealUpload = async (fileToUpload) => {
    setStep('processing');
    setProgress(10);
    setError(null);

    const formData = new FormData();
    formData.append('file', fileToUpload);

    const uploadProgressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(uploadProgressInterval);
          return 90;
        }
        return prev + 5;
      });
    }, 300);

    try {
      const res = await api.post('/ai/extract/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      clearInterval(uploadProgressInterval);
      setProgress(100);
      
      const mapped = mapBackendExtractedDataToFrontend(res.data);
      setExtractedData(mapped);
      setStep('review');
    } catch (err) {
      clearInterval(uploadProgressInterval);
      console.error("Extraction error", err);
      setError(err.response?.data?.error || err.response?.data?.details || "Failed to extract resume data. Please make sure the backend is running and supports this file.");
      setStep('upload');
      setFile(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // 1. Create a new resume
      const title = extractedData.personal.fullName ? `${extractedData.personal.fullName} Resume` : 'Untitled Resume';
      const resResume = await api.post('/resumes/', { title });
      const resumeId = resResume.data.id;

      // 2. Create the base version
      const resVersion = await api.post('/versions/', {
        resume: resumeId,
        version_name: 'Base Version',
        is_base: true
      });
      const versionId = resVersion.data.id;

      // 3. Prepare sections
      const sectionsToCreate = [];

      // A. Personal Info
      sectionsToCreate.push({
        version: versionId,
        section_type: 'personal',
        title: 'Personal Information',
        content: {
          first_name: extractedData.personal.fullName.split(' ')[0] || '',
          last_name: extractedData.personal.fullName.split(' ').slice(1).join(' ') || '',
          email: extractedData.personal.email || '',
          phone: extractedData.personal.phone || '',
          location: extractedData.personal.location || '',
          linkedin: extractedData.personal.linkedin || '',
          website: extractedData.personal.website || '',
          photo_url: ''
        },
        order: 0
      });

      // B. Summary
      if (extractedData.summary) {
        sectionsToCreate.push({
          version: versionId,
          section_type: 'summary',
          title: 'Professional Summary',
          content: { text: extractedData.summary },
          order: 1
        });
      }

      let orderIdx = 2;

      // C. Experience
      extractedData.experience.forEach(item => {
        const dates = item.date.split('-');
        sectionsToCreate.push({
          version: versionId,
          section_type: 'experience',
          title: 'Work Experience',
          content: {
            company_name: item.company || '',
            job_title: item.title || '',
            start_date: dates[0]?.trim() || '',
            end_date: dates[1]?.trim() || 'Present',
            description: item.description || ''
          },
          order: orderIdx++
        });
      });

      // D. Education
      extractedData.education.forEach(item => {
        const dates = item.date.split('-');
        sectionsToCreate.push({
          version: versionId,
          section_type: 'education',
          title: 'Education',
          content: {
            school_name: item.school || '',
            degree: item.degree || '',
            field: '',
            start_date: dates[0]?.trim() || '',
            end_date: dates[1]?.trim() || ''
          },
          order: orderIdx++
        });
      });

      // E. Skills
      if (extractedData.skills) {
        const skillsArray = extractedData.skills.split(',').map(s => s.trim()).filter(Boolean);
        skillsArray.forEach(skillName => {
          sectionsToCreate.push({
            version: versionId,
            section_type: 'skills',
            title: 'Skills',
            content: { name: skillName },
            order: orderIdx++
          });
        });
      }

      // Post all sections
      await Promise.all(sectionsToCreate.map(sec => api.post('/sections/', sec)));

      // Redirect
      navigate(`/app/resumes/${resumeId}/edit`);
    } catch (err) {
      console.error("Failed to save extracted resume", err);
      setError("Failed to create resume from extracted data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDataChange = (section, field, value) => {
    setExtractedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section, index, field, value) => {
    setExtractedData(prev => {
      const newArray = [...prev[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [section]: newArray };
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500 min-h-[calc(100vh-theme(spacing.16))] flex flex-col justify-center">
      
      {step === 'upload' && (
        <div className="text-center max-w-2xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Already have a resume?</h1>
            <p className="text-slate-500 mt-3 text-lg">Upload your existing CV and we'll turn it into an editable resume instantly.</p>
          </div>

          <Card className={`border-2 border-dashed transition-all duration-200 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'} ${error ? 'border-rose-400 bg-rose-50' : ''}`}>
            <div 
              className="p-12 flex flex-col items-center justify-center cursor-pointer"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-white shadow-sm text-slate-500'}`}>
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-700">
                {isDragging ? 'Drop your resume here' : 'Click or drag file to upload'}
              </h3>
              <p className="text-slate-500 text-sm mb-6">Supports PDF and DOCX formats up to 5MB.</p>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden" 
              />
              
              <Button className="pointer-events-none bg-white text-slate-700 border hover:bg-slate-50">
                Browse Files
              </Button>
            </div>
          </Card>
          
          {error && (
            <div className="mt-4 p-4 bg-rose-50 text-rose-700 rounded-lg flex items-center justify-center text-sm font-medium animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center max-w-md mx-auto w-full animate-in zoom-in-95 duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
            <div className="w-20 h-20 rounded-full bg-indigo-50 mx-auto flex items-center justify-center mb-6 relative">
               <FileText className="w-10 h-10 text-indigo-600 z-10" />
               <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
               <div 
                 className="absolute inset-0 border-4 border-indigo-600 rounded-full transition-all duration-300"
                 style={{ clipPath: `polygon(0 0, 100% 0, 100% ${progress}%, 0 ${progress}%)` }} // Simple visually interesting filling effect
               ></div>
            </div>
            
            <h3 className="text-xl font-bold mb-2">Analyzing your resume</h3>
            <p className="text-slate-500 text-sm mb-8 h-5">
              {progress < 30 ? "Extracting text structure..." : 
               progress < 60 ? "Identifying sections and dates..." : 
               progress < 90 ? "Structuring experience and skills..." : 
               "Finalizing extraction..."}
            </p>

            <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-right text-xs font-semibold text-slate-400">{progress}%</div>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-2" />
                Extraction Complete
              </h1>
              <p className="text-slate-500 mt-1">Review the extracted information below before creating your editable resume.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => {setStep('upload'); setFile(null);}}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                {isSaving ? (
                  <span className="flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</span>
                ) : (
                  <span className="flex items-center">Confirm & Create Resume <ArrowRight className="w-4 h-4 ml-2" /></span>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Personal Info */}
            <Card>
              <CardHeader className="bg-slate-50 border-b py-4">
                <CardTitle className="text-base flex items-center text-slate-700">
                  <User className="w-4 h-4 mr-2" /> Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Full Name</label>
                  <input type="text" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={extractedData.personal.fullName} onChange={e => handleDataChange('personal', 'fullName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Email</label>
                  <input type="text" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={extractedData.personal.email} onChange={e => handleDataChange('personal', 'email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Phone</label>
                  <input type="text" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={extractedData.personal.phone} onChange={e => handleDataChange('personal', 'phone', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Location</label>
                  <input type="text" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={extractedData.personal.location} onChange={e => handleDataChange('personal', 'location', e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader className="bg-slate-50 border-b py-4">
                <CardTitle className="text-base flex items-center text-slate-700">
                  <FileText className="w-4 h-4 mr-2" /> Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <textarea className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]" value={extractedData.summary} onChange={e => setExtractedData(prev => ({...prev, summary: e.target.value}))} />
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader className="bg-slate-50 border-b py-4">
                <CardTitle className="text-base flex items-center text-slate-700">
                  <Briefcase className="w-4 h-4 mr-2" /> Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {extractedData.experience.map((exp, index) => (
                  <div key={exp.id} className="p-4 bg-slate-50 rounded-lg border">
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Job Title</label>
                        <input type="text" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={exp.title} onChange={e => handleArrayChange('experience', index, 'title', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Company</label>
                        <input type="text" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={exp.company} onChange={e => handleArrayChange('experience', index, 'company', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Description</label>
                      <textarea className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white min-h-[80px]" value={exp.description} onChange={e => handleArrayChange('experience', index, 'description', e.target.value)} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader className="bg-slate-50 border-b py-4">
                <CardTitle className="text-base flex items-center text-slate-700">
                  <Code className="w-4 h-4 mr-2" /> Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <textarea className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]" value={extractedData.skills} onChange={e => setExtractedData(prev => ({...prev, skills: e.target.value}))} />
              </CardContent>
            </Card>
            
          </div>
        </div>
      )}
    </div>
  );
}
