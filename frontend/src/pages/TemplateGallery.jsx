import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Eye, UploadCloud, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { TemplateRenderer } from '../components/editor/TemplateRenderer';

const sampleResumeData = {
  personalInfo: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '(555) 123-4567',
    location: 'New York, NY',
    summary: 'Experienced professional with a track record of driving results.'
  },
  experience: [
    { id: '1', position: 'Senior Product Manager', company: 'Tech Innovators', startDate: '2020', endDate: 'Present', description: 'Led cross-functional teams to launch successful SaaS products.' },
    { id: '2', position: 'Product Manager', company: 'Software Co', startDate: '2017', endDate: '2020', description: 'Managed product lifecycle from ideation to launch.' }
  ],
  education: [
    { id: '1', institution: 'University of Technology', degree: 'MBA', fieldOfStudy: 'Business', startDate: '2015', endDate: '2017' }
  ],
  skills: [
    { id: '1', name: 'Product Strategy' },
    { id: '2', name: 'Agile' },
    { id: '3', name: 'Data Analysis' }
  ]
};

const TemplateThumbnail = ({ templateId, onPreview }) => {
  return (
    <div className="w-full aspect-[1/1.414] bg-slate-100 border shadow-sm relative overflow-hidden group flex items-start justify-center pt-4">
      {/* Container to scale down the renderer */}
      <div className="absolute top-0 left-0 origin-top-left pointer-events-none" style={{ transform: 'scale(0.24)' }}>
        <TemplateRenderer templateId={templateId} resumeData={sampleResumeData} scale={1} />
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px] z-10">
        <Button variant="secondary" size="sm" className="shadow-lg pointer-events-auto" onClick={(e) => {
          e.stopPropagation();
          onPreview();
        }}>
          <Eye className="w-4 h-4 mr-2" /> Preview
        </Button>
      </div>
    </div>
  );
};

export function TemplateGallery() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState(new Set(['modern-blue', 'creative']));

  const categories = ['All', 'ATS Friendly', 'Modern', 'Minimal', 'Professional', 'Executive', 'Creative'];

  const templates = [
    { id: 'modern-blue', name: 'Modern Blue', category: 'Modern', atsFriendly: false },
    { id: 'minimal', name: 'Minimal', category: 'Minimal', atsFriendly: true },
    { id: 'executive', name: 'Executive', category: 'Executive', atsFriendly: true },
    { id: 'creative', name: 'Creative', category: 'Creative', atsFriendly: false },
    { id: 'ats-professional', name: 'ATS Professional', category: 'ATS Friendly', atsFriendly: true },
    { id: 'modern-two-column', name: 'Modern Two Column', category: 'Modern', atsFriendly: false }
  ];

  const toggleFavorite = (id) => {
    const next = new Set(favorites);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFavorites(next);
  };

  const filteredTemplates = templates.filter(t => 
    (activeCategory === 'All' || t.category === activeCategory || (activeCategory === 'ATS Friendly' && t.atsFriendly)) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Gallery</h1>
          <p className="text-muted-foreground mt-1">Choose a professional design to get started.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="w-full md:w-auto">
            <UploadCloud className="w-4 h-4 mr-2" /> Upload Your Template
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Categories */}
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:w-48 shrink-0 pb-2 lg:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm rounded-md transition-colors whitespace-nowrap lg:text-left ${
                activeCategory === cat 
                  ? 'bg-primary text-primary-foreground font-medium' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-6">
          {/* Search and Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
            <div className="relative shrink-0">
               <select 
                 className="appearance-none bg-white border border-input rounded-md pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
               >
                 <option value="popular">Most Popular</option>
                 <option value="newest">Newest First</option>
                 <option value="alphabetical">A-Z</option>
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map(template => (
              <div key={template.id} className="group flex flex-col gap-3">
                <div className="relative cursor-pointer" onClick={() => navigate('/app/resumes/new/edit', { state: { templateLayout: template.id, templateId: template.id } })}>
                  <TemplateThumbnail 
                    templateId={template.id}
                    onPreview={() => navigate('/app/resumes/new/edit', { state: { templateLayout: template.id, templateId: template.id } })}
                  />
                  
                  {/* Absolute positioning overlays */}
                  <div className="absolute top-2 right-2 flex flex-col items-end gap-2 z-20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(template.id); }}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(template.id) ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
                    </button>
                  </div>
                  
                  {template.atsFriendly && (
                    <div className="absolute top-2 left-2 z-20">
                      <Badge variant="success" className="bg-emerald-500/90 hover:bg-emerald-500/90 shadow-sm backdrop-blur-sm border-none">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> ATS Ready
                      </Badge>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                    <span className="text-xs text-muted-foreground">{template.category}</span>
                  </div>
                  <Button 
                    className="w-full mt-3" 
                    size="sm"
                    onClick={() => {
                      navigate('/app/resumes/new/edit', { state: { templateLayout: template.id, templateId: template.id } });
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredTemplates.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <p>No templates found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
