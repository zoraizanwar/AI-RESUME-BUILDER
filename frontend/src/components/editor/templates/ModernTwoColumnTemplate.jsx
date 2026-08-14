import React from 'react';

export function ModernTwoColumnTemplate({ data }) {
  const { personalInfo = {}, experience = [], education = [], skills = [], languages = [], projects = [], certifications = [] } = data || {};

  return (
    <div className="font-sans text-slate-800 flex min-h-[1056px] bg-white">
      
      {/* Left Sidebar */}
      <aside className="w-[35%] bg-slate-100 p-8 border-r border-slate-200">
        {/* Header (Name & Title inside sidebar for this layout) */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-2">
            {personalInfo.firstName || 'First'} {personalInfo.lastName || 'Last'}
          </h1>
          {personalInfo.summary && (
            <p className="text-sm text-slate-600 mt-4 leading-relaxed">{personalInfo.summary}</p>
          )}
        </div>

        {/* Contact Info */}
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 border-b border-slate-300 pb-2">Contact</h2>
          <ul className="space-y-3 text-sm text-slate-600">
            {personalInfo.email && <li className="break-all">{personalInfo.email}</li>}
            {personalInfo.phone && <li>{personalInfo.phone}</li>}
            {personalInfo.location && <li>{personalInfo.location}</li>}
            {personalInfo.linkedin && <li className="break-all">{personalInfo.linkedin}</li>}
            {personalInfo.website && <li className="break-all">{personalInfo.website}</li>}
          </ul>
        </section>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 border-b border-slate-300 pb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill.id} className="bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-medium shadow-sm">
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 border-b border-slate-300 pb-2">Languages</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              {languages.map(lang => (
                <li key={lang.id}>
                  <span className="font-semibold text-slate-800">{lang.title || lang.name}</span>
                  {lang.description && <span className="ml-2">- {lang.description}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      {/* Main Content */}
      <main className="w-[65%] p-8 bg-white">
        
        {/* Experience */}
        {experience && experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wider text-teal-600 mb-6 flex items-center">
              <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-3 text-teal-700 text-xs">💼</span>
              Experience
            </h2>
            <div className="space-y-6">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900 text-base">{exp.position}</h3>
                    <span className="text-teal-600 text-sm font-semibold whitespace-nowrap ml-4">
                      {exp.startDate} {exp.startDate && exp.endDate ? '-' : ''} {exp.endDate}
                    </span>
                  </div>
                  <div className="text-slate-600 font-medium text-sm mb-2">{exp.company}</div>
                  <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wider text-teal-600 mb-6 flex items-center">
              <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-3 text-teal-700 text-xs">🎓</span>
              Education
            </h2>
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</h3>
                    <span className="text-teal-600 text-sm font-semibold whitespace-nowrap ml-4">
                      {edu.startDate} {edu.startDate && edu.endDate ? '-' : ''} {edu.endDate}
                    </span>
                  </div>
                  <div className="text-slate-600 font-medium text-sm">{edu.institution}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wider text-teal-600 mb-6 flex items-center">
              <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-3 text-teal-700 text-xs">🚀</span>
              Projects
            </h2>
            <div className="space-y-4">
              {projects.map(proj => (
                <div key={proj.id}>
                  <h3 className="font-bold text-slate-900">{proj.title || proj.name}</h3>
                  {proj.description && <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap mt-1">{proj.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wider text-teal-600 mb-6 flex items-center">
              <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-3 text-teal-700 text-xs">📜</span>
              Certifications
            </h2>
            <div className="space-y-4">
              {certifications.map(cert => (
                <div key={cert.id}>
                  <h3 className="font-bold text-slate-900">{cert.title || cert.name}</h3>
                  {cert.description && <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap mt-1">{cert.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Custom Sections */}
        {data.customSections && data.customSections.map(sec => {
          const items = data[sec.id];
          if (!items || items.length === 0) return null;
          return (
            <section key={sec.id} className="mb-8">
              <h2 className="text-lg font-bold uppercase tracking-wider text-teal-600 mb-6 flex items-center">
                <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mr-3 text-teal-700 text-xs">⭐</span>
                {sec.label}
              </h2>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id}>
                    <h3 className="font-bold text-slate-900">{item.title || item.name}</h3>
                    {item.description && <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap mt-1">{item.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
