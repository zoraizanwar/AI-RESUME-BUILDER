import React from 'react';

export function AtsProfessionalTemplate({ data }) {
  const { personalInfo = {}, experience = [], education = [], skills = [] } = data || {};

  return (
    <div className="font-sans text-black leading-tight max-w-[800px] mx-auto bg-white p-8">
      <header className="text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold uppercase mb-2">
          {personalInfo.firstName || 'First'} {personalInfo.lastName || 'Last'}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-3 text-sm font-medium">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>| {personalInfo.phone}</span>}
          {personalInfo.location && <span>| {personalInfo.location}</span>}
          {personalInfo.linkedin && <span>| {personalInfo.linkedin}</span>}
        </div>
      </header>

      {personalInfo.summary && (
        <section className="mb-6">
          <p className="text-sm text-justify">{personalInfo.summary}</p>
        </section>
      )}

      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-black mb-3">Professional Experience</h2>
          <div className="space-y-4">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-base">{exp.position}</h3>
                  <span className="text-sm font-bold">{exp.startDate} {exp.startDate && exp.endDate ? '-' : ''} {exp.endDate}</span>
                </div>
                <div className="text-sm font-medium mb-2">{exp.company}</div>
                <div className="text-sm pl-4 whitespace-pre-wrap list-disc">
                  {exp.description}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-black mb-3">Education</h2>
          <div className="space-y-4">
            {education.map(edu => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="font-bold text-base">{edu.institution}</h3>
                  <div className="text-sm">{edu.degree} {edu.fieldOfStudy ? `- ${edu.fieldOfStudy}` : ''}</div>
                </div>
                <span className="text-sm font-bold">{edu.startDate} {edu.startDate && edu.endDate ? '-' : ''} {edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-black mb-3">Technical Skills</h2>
          <div className="text-sm">
            <span className="font-bold">Skills: </span>
            {skills.map(s => s.name).join(', ')}
          </div>
        </section>
      )}

      {data.projects && data.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-black mb-3">Projects</h2>
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

      {data.customSections && data.customSections.map(sec => {
        const items = data[sec.id];
        if (!items || items.length === 0) return null;
        return (
          <section key={sec.id} className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b border-black mb-3">{sec.label}</h2>
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
