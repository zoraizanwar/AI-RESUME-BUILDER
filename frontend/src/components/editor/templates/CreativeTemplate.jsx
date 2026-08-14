import React from 'react';

export function CreativeTemplate({ data }) {
  const { personalInfo, experience, education, skills, projects, certifications, languages } = data;

  return (
    <div className="font-sans text-gray-800 flex min-h-[1056px] bg-white">
      {/* Left Sidebar */}
      <aside className="w-1/3 bg-slate-900 text-white p-8">
        {/* Profile Photo */}
        {personalInfo.photoUrl && (
          <div className="flex justify-center mb-8">
            <img 
              src={personalInfo.photoUrl} 
              alt="Profile" 
              className="w-32 h-32 rounded-full border-4 border-slate-700 object-cover"
            />
          </div>
        )}

        {/* Contact Info */}
        <section className="mb-8">
          <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-700 pb-2">Contact</h2>
          <ul className="space-y-3 text-sm text-slate-300">
            {personalInfo.email && (
              <li className="flex items-center break-all">
                <span className="w-6 h-6 mr-3 flex items-center justify-center bg-slate-800 rounded-full text-xs">✉</span>
                {personalInfo.email}
              </li>
            )}
            {personalInfo.phone && (
              <li className="flex items-center">
                <span className="w-6 h-6 mr-3 flex items-center justify-center bg-slate-800 rounded-full text-xs">☎</span>
                {personalInfo.phone}
              </li>
            )}
            {personalInfo.location && (
              <li className="flex items-center">
                <span className="w-6 h-6 mr-3 flex items-center justify-center bg-slate-800 rounded-full text-xs">⚲</span>
                {personalInfo.location}
              </li>
            )}
            {personalInfo.linkedin && (
              <li className="flex items-center break-all">
                <span className="w-6 h-6 mr-3 flex items-center justify-center bg-slate-800 rounded-full text-xs">in</span>
                {personalInfo.linkedin}
              </li>
            )}
            {personalInfo.website && (
              <li className="flex items-center break-all">
                <span className="w-6 h-6 mr-3 flex items-center justify-center bg-slate-800 rounded-full text-xs">🌐</span>
                {personalInfo.website}
              </li>
            )}
          </ul>
        </section>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-700 pb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill.id} className="bg-slate-800 text-slate-300 px-3 py-1 rounded text-sm font-medium">
                  {skill.name} {skill.level ? `(${skill.level})` : ''}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-700 pb-2">Languages</h2>
            <ul className="space-y-2">
              {languages.map(lang => (
                <li key={lang.id} className="text-sm">
                  <span className="font-semibold text-white">{lang.title || lang.name}</span>
                  {lang.description && <span className="text-slate-400 ml-2 text-xs">- {lang.description}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      {/* Main Content */}
      <main className="w-2/3 p-8 bg-slate-50">
        <header className="mb-8 border-b-2 border-indigo-500 pb-6">
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight uppercase">
            <span className="text-indigo-600">{personalInfo.firstName || 'Jane'}</span> {personalInfo.lastName || 'Doe'}
          </h1>
          {/* We don't have a specific "job title" field in personalInfo, but summary could serve as intro */}
        </header>

        {/* Summary */}
        {personalInfo.summary && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-widest text-indigo-600 mb-3 flex items-center">
              <span className="w-8 h-px bg-indigo-300 mr-4"></span>
              Profile
            </h2>
            <p className="text-sm leading-relaxed text-slate-700">{personalInfo.summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center">
              <span className="w-8 h-px bg-indigo-300 mr-4"></span>
              Experience
            </h2>
            <div className="space-y-6">
              {experience.map(exp => (
                <div key={exp.id} className="relative pl-4 border-l-2 border-indigo-200">
                  <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 ring-4 ring-slate-50"></div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900 text-lg">{exp.position}</h3>
                  </div>
                  <div className="flex justify-between items-baseline mb-2 text-sm">
                    <span className="text-indigo-700 font-semibold">{exp.company}</span>
                    <span className="text-slate-500 font-medium">
                      {exp.startDate} {exp.startDate && exp.endDate ? '-' : ''} {exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center">
              <span className="w-8 h-px bg-indigo-300 mr-4"></span>
              Education
            </h2>
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id} className="relative pl-4 border-l-2 border-indigo-200">
                  <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 ring-4 ring-slate-50"></div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</h3>
                  </div>
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-indigo-700 font-semibold">{edu.institution}</span>
                    <span className="text-slate-500 font-medium">
                      {edu.startDate} {edu.startDate && edu.endDate ? '-' : ''} {edu.endDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center">
              <span className="w-8 h-px bg-indigo-300 mr-4"></span>
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
            <h2 className="text-lg font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center">
              <span className="w-8 h-px bg-indigo-300 mr-4"></span>
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
              <h2 className="text-lg font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center">
                <span className="w-8 h-px bg-indigo-300 mr-4"></span>
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
