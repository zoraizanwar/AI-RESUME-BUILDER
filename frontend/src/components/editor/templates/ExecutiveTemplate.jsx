import React from 'react';

export function ExecutiveTemplate({ data }) {
  const { personalInfo = {}, experience = [], education = [], skills = [] } = data || {};

  return (
    <div className="font-serif text-gray-900 leading-relaxed">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">
          {personalInfo.firstName || 'First'} {personalInfo.lastName || 'Last'}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-gray-700">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>| {personalInfo.phone}</span>}
          {personalInfo.location && <span>| {personalInfo.location}</span>}
          {personalInfo.linkedin && <span>| {personalInfo.linkedin}</span>}
        </div>
      </header>

      {personalInfo.summary && (
        <section className="mb-6">
          <p className="text-sm">{personalInfo.summary}</p>
        </section>
      )}

      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold uppercase border-b border-gray-400 mb-3 pb-1">Professional Experience</h2>
          <div className="space-y-4">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold">{exp.position}</h3>
                  <span className="text-sm font-semibold">{exp.startDate} {exp.startDate && exp.endDate ? '-' : ''} {exp.endDate}</span>
                </div>
                <div className="italic text-gray-800 mb-2">{exp.company}</div>
                <p className="text-sm whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold uppercase border-b border-gray-400 mb-3 pb-1">Education</h2>
          <div className="space-y-4">
            {education.map(edu => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="font-bold">{edu.institution}</h3>
                  <div className="text-sm italic">{edu.degree} {edu.fieldOfStudy ? `- ${edu.fieldOfStudy}` : ''}</div>
                </div>
                <span className="text-sm font-semibold">{edu.startDate} {edu.startDate && edu.endDate ? '-' : ''} {edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold uppercase border-b border-gray-400 mb-3 pb-1">Skills</h2>
          <p className="text-sm">
            {skills.map(s => s.name).join(', ')}
          </p>
        </section>
      )}

      {data.projects && data.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold uppercase border-b border-gray-400 mb-3 pb-1">Projects</h2>
          <div className="space-y-4">
            {data.projects.map(proj => (
              <div key={proj.id}>
                <h3 className="font-bold">{proj.title || proj.name}</h3>
                {proj.description && <p className="text-sm whitespace-pre-wrap mt-1">{proj.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold uppercase border-b border-gray-400 mb-3 pb-1">Certifications</h2>
          <div className="space-y-4">
            {data.certifications.map(cert => (
              <div key={cert.id}>
                <h3 className="font-bold">{cert.title || cert.name}</h3>
                {cert.description && <p className="text-sm whitespace-pre-wrap mt-1">{cert.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.languages && data.languages.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold uppercase border-b border-gray-400 mb-3 pb-1">Languages</h2>
          <div className="space-y-2">
            {data.languages.map(lang => (
              <div key={lang.id} className="text-sm flex gap-2">
                <span className="font-bold">{lang.title || lang.name}</span>
                {lang.description && <span className="text-gray-700">- {lang.description}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.customSections && data.customSections.map(sec => {
        const items = data[sec.id];
        if (!items || items.length === 0) return null;
        return (
          <section key={sec.id} className="mb-6">
            <h2 className="text-xl font-bold uppercase border-b border-gray-400 mb-3 pb-1">{sec.label}</h2>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id}>
                  <h3 className="font-bold">{item.title || item.name}</h3>
                  {item.description && <p className="text-sm whitespace-pre-wrap mt-1">{item.description}</p>}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
