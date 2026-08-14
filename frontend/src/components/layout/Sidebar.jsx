import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, Sparkles, LayoutTemplate, Briefcase, MessageSquare, Mic } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/app' },
    { name: 'My Resumes', icon: FileText, path: '/app/resumes' },
    { name: 'Templates', icon: LayoutTemplate, path: '/app/templates' },
    { name: 'Job Matcher', icon: Briefcase, path: '/app/job-matcher' },
    { name: 'ATS Analyzer', icon: Sparkles, path: '/app/ats-analyzer' },
    { name: 'Interview Prep', icon: Mic, path: '/app/interview-prep' },
    { name: 'AI Assistant', icon: MessageSquare, path: '/app/ai-assistant' },
    { name: 'Settings', icon: Settings, path: '/app/settings' },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <span className="text-xl font-bold text-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          ResumeAI
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/app'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
