import React from 'react';

export function ModernBlueTemplate({ data }) {
  // Very basic render of the resume data for preview purposes
  const { personalInfo } = data;

  return (
    <div className="font-sans text-gray-900">
      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 mb-6">
        <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">
          {personalInfo.firstName || 'Jane'} {personalInfo.lastName || 'Doe'}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-widest text-gray-800 mb-3">Professional Summary</h2>
          <p className="text-sm leading-relaxed">{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-widest text-gray-800 mb-3 border-b-2 border-gray-200 pb-1">Experience</h2>
          <div className="space-y-4">
            {data.experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                  <span className="text-sm text-gray-500 font-medium whitespace-nowrap ml-4">{exp.startDate} {exp.startDate && exp.endDate ? '-' : ''} {exp.endDate}</span>
                </div>
                <div className="text-gray-700 italic text-sm mb-2">{exp.company}</div>
                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-widest text-gray-800 mb-3 border-b-2 border-gray-200 pb-1">Education</h2>
          <div className="space-y-4">
            {data.education.map(edu => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-900">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</h3>
                  <span className="text-sm text-gray-500 font-medium whitespace-nowrap ml-4">{edu.startDate} {edu.startDate && edu.endDate ? '-' : ''} {edu.endDate}</span>
                </div>
                <div className="text-gray-700 italic text-sm">{edu.institution}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-widest text-gray-800 mb-3 border-b-2 border-gray-200 pb-1">Skills</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {data.skills.map(skill => (
              <span key={skill.id} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">
                {skill.name} {skill.level ? `(${skill.level})` : ''}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-widest text-gray-800 mb-3 border-b-2 border-gray-200 pb-1">Projects</h2>
          <div className="space-y-4">
            {data.projects.map(proj => (
              <div key={proj.id}>
                <h3 className="font-semibold text-gray-900">{proj.title || proj.name}</h3>
                {proj.description && <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{proj.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-widest text-gray-800 mb-3 border-b-2 border-gray-200 pb-1">Certifications</h2>
          <div className="space-y-4">
            {data.certifications.map(cert => (
              <div key={cert.id}>
                <h3 className="font-semibold text-gray-900">{cert.title || cert.name}</h3>
                {cert.description && <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{cert.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {data.languages && data.languages.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-widest text-gray-800 mb-3 border-b-2 border-gray-200 pb-1">Languages</h2>
          <div className="space-y-2">
            {data.languages.map(lang => (
              <div key={lang.id} className="text-sm">
                <span className="font-semibold text-gray-900">{lang.title || lang.name}</span>
                {lang.description && <span className="text-gray-600 ml-2">- {lang.description}</span>}
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
          <section key={sec.id} className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-widest text-gray-800 mb-3 border-b-2 border-gray-200 pb-1">{sec.label}</h2>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id}>
                  <h3 className="font-semibold text-gray-900">{item.title || item.name}</h3>
                  {item.description && <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{item.description}</p>}
                </div>
              ))}
            </div>
          </section>
        );
      })}

    </div>
  );
}
