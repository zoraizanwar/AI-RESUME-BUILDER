import React from 'react';

export function MinimalTemplate({ data }) {
  const { personalInfo = {}, experience = [], education = [], skills = [] } = data || {};

  return (
    <div className="font-sans text-gray-800 text-sm flex flex-col md:flex-row gap-8">
      {/* Left Column (Sidebar) */}
      <div className="w-full md:w-1/3 space-y-8">
        <div>
          <h1 className="text-3xl font-light mb-1">{personalInfo.firstName}</h1>
          <h1 className="text-3xl font-bold mb-4">{personalInfo.lastName}</h1>
          
          <div className="space-y-2 text-gray-600 text-xs">
            {personalInfo.email && <p>{personalInfo.email}</p>}
            {personalInfo.phone && <p>{personalInfo.phone}</p>}
            {personalInfo.location && <p>{personalInfo.location}</p>}
            {personalInfo.website && <p>{personalInfo.website}</p>}
            {personalInfo.linkedin && <p>{personalInfo.linkedin}</p>}
          </div>
        </div>

        {skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Skills</h2>
            <div className="space-y-1">
              {skills.map(s => (
                <div key={s.id} className="text-gray-700">{s.name}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column (Main) */}
      <div className="w-full md:w-2/3 space-y-8">
        {personalInfo.summary && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Profile</h2>
            <p className="leading-relaxed">{personalInfo.summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Experience</h2>
            <div className="space-y-6">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900">{exp.position}</h3>
                    <span className="text-xs text-gray-400">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <div className="text-gray-500 mb-2">{exp.company}</div>
                  <p className="whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Education</h2>
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                    <span className="text-xs text-gray-400">{edu.startDate} - {edu.endDate}</span>
                  </div>
                  <div className="text-gray-500">{edu.institution} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projects && data.projects.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Projects</h2>
            <div className="space-y-4">
              {data.projects.map(proj => (
                <div key={proj.id}>
                  <h3 className="font-bold text-gray-900">{proj.title || proj.name}</h3>
                  {proj.description && <p className="text-gray-600 whitespace-pre-wrap text-sm mt-1">{proj.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.certifications && data.certifications.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Certifications</h2>
            <div className="space-y-4">
              {data.certifications.map(cert => (
                <div key={cert.id}>
                  <h3 className="font-bold text-gray-900">{cert.title || cert.name}</h3>
                  {cert.description && <p className="text-gray-600 whitespace-pre-wrap text-sm mt-1">{cert.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.languages && data.languages.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Languages</h2>
            <div className="space-y-2">
              {data.languages.map(lang => (
                <div key={lang.id} className="text-sm">
                  <span className="font-bold text-gray-900">{lang.title || lang.name}</span>
                  {lang.description && <span className="text-gray-500 ml-2">• {lang.description}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.customSections && data.customSections.map(sec => {
          const items = data[sec.id];
          if (!items || items.length === 0) return null;
          return (
            <div key={sec.id}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{sec.label}</h2>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id}>
                    <h3 className="font-bold text-gray-900">{item.title || item.name}</h3>
                    {item.description && <p className="text-gray-600 whitespace-pre-wrap text-sm mt-1">{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
