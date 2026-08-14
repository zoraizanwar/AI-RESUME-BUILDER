import React from 'react';
import { useResumeBuilder } from './ResumeBuilderContext';

export default function LivePreview() {
  const { resume, sections } = useResumeBuilder();

  const getSection = (type) => sections.find(s => s.section_type === type)?.content || null;

  const personal = getSection('personal');
  const summary = getSection('summary');
  const experience = getSection('experience') || [];
  const education = getSection('education') || [];
  const projects = getSection('projects') || [];
  const skills = getSection('skills') || [];
  const certifications = getSection('certifications') || [];
  const awards = getSection('awards') || [];
  const languages = getSection('languages') || [];
  const volunteer = getSection('volunteer') || [];
  const custom = getSection('custom') || [];

  return (
    <div className="bg-white shadow-xl max-w-[800px] mx-auto min-h-[1056px] p-10 font-sans text-gray-800">
      
      {/* HEADER: Personal Info */}
      <header className="text-center mb-6 border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">
          {personal?.name || 'YOUR NAME'}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-gray-600">
          {personal?.email && <span>{personal.email}</span>}
          {personal?.phone && <span>• {personal.phone}</span>}
          {personal?.location && <span>• {personal.location}</span>}
          {personal?.linkedin && <span>• {personal.linkedin}</span>}
          {personal?.website && <span>• {personal.website}</span>}
        </div>
      </header>

      {/* SUMMARY */}
      {summary?.text && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-2">Professional Summary</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary.text}</p>
        </section>
      )}

      {/* EXPERIENCE */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3">Experience</h2>
          <div className="flex flex-col gap-4">
            {experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-md">{exp.title}</h3>
                  <span className="text-sm font-semibold text-gray-600">
                    {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm italic">{exp.company}</span>
                  <span className="text-sm text-gray-500">{exp.location}</span>
                </div>
                {exp.description && (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-gray-200">
                    {exp.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EDUCATION */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3">Education</h2>
          <div className="flex flex-col gap-4">
            {education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-md">{edu.institution}</h3>
                  <span className="text-sm font-semibold text-gray-600">
                    {edu.start_date} - {edu.current ? 'Present' : edu.end_date}
                  </span>
                </div>
                <div className="mb-1">
                  <span className="text-sm font-medium">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                </div>
                {edu.description && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PROJECTS */}
      {projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3">Projects</h2>
          <div className="flex flex-col gap-4">
            {projects.map((proj, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-md">
                    {proj.name}
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noreferrer" className="text-blue-600 text-xs ml-2 font-normal hover:underline">
                        (Link)
                      </a>
                    )}
                  </h3>
                </div>
                {proj.description && (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-gray-200">
                    {proj.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SKILLS */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full font-medium">
                {skill.name} {skill.level && <span className="text-gray-500 font-normal text-xs ml-1">({skill.level})</span>}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* CERTIFICATIONS */}
      {certifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3">Certifications</h2>
          <ul className="list-disc list-inside text-sm flex flex-col gap-1">
            {certifications.map((cert, index) => (
              <li key={index}>
                <span className="font-medium">{cert.name}</span> — {cert.issuer} <span className="text-gray-500 ml-2">{cert.date}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* AWARDS */}
      {awards.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3">Awards & Honors</h2>
          <ul className="list-disc list-inside text-sm flex flex-col gap-1">
            {awards.map((award, index) => (
              <li key={index}>
                <span className="font-medium">{award.name}</span> — {award.issuer} <span className="text-gray-500 ml-2">{award.date}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* LANGUAGES */}
      {languages.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3">Languages</h2>
          <div className="flex flex-wrap gap-4">
            {languages.map((lang, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{lang.name}</span>
                {lang.proficiency && <span className="text-gray-500 ml-1">({lang.proficiency})</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* VOLUNTEER */}
      {volunteer.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3">Volunteer Experience</h2>
          <div className="flex flex-col gap-4">
            {volunteer.map((vol, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-md">{vol.role}</h3>
                  <span className="text-sm font-semibold text-gray-600">
                    {vol.start_date} - {vol.current ? 'Present' : vol.end_date}
                  </span>
                </div>
                <div className="text-sm italic mb-1">{vol.organization}</div>
                {vol.description && (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-gray-200">
                    {vol.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CUSTOM SECTIONS */}
      {custom.length > 0 && custom.map((c, idx) => (
        <section className="mb-6" key={idx}>
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 mb-3">{c.title || 'Custom Section'}</h2>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {c.description}
          </div>
        </section>
      ))}
      
    </div>
  );
}
