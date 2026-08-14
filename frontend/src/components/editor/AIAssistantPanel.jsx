import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Sparkles, MessageSquare, Send, Zap, Briefcase, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

export function AIAssistantPanel() {
  const { activeSection } = useEditorStore();

  const renderContextualActions = () => {
    switch (activeSection) {
      case 'personalInfo':
        return (
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              <Sparkles className="w-4 h-4 mr-2" /> Write Professional Summary
            </Button>
          </div>
        );
      case 'experience':
        return (
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              <Sparkles className="w-4 h-4 mr-2" /> Improve Bullet Points
            </Button>
            <Button variant="outline" className="w-full justify-start text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Make Results-Oriented
            </Button>
            <Button variant="outline" className="w-full justify-start text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              <Zap className="w-4 h-4 mr-2" /> Make More Concise
            </Button>
            <Button variant="outline" className="w-full justify-start text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              <FileText className="w-4 h-4 mr-2" /> Make ATS-Friendly
            </Button>
          </div>
        );
      case 'skills':
        return (
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              <Sparkles className="w-4 h-4 mr-2" /> Suggest Missing Skills
            </Button>
            <Button variant="outline" className="w-full justify-start text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              <Briefcase className="w-4 h-4 mr-2" /> Match to Target Job
            </Button>
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              <Sparkles className="w-4 h-4 mr-2" /> Improve Section
            </Button>
            <Button variant="outline" className="w-full justify-start text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              <FileText className="w-4 h-4 mr-2" /> Make ATS-Friendly
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l">
      <div className="p-4 border-b shrink-0 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h2 className="font-semibold text-lg">AI Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-900 mb-3">Contextual Actions</p>
          {renderContextualActions()}
        </div>

        <div className="mt-auto">
          <div className="bg-slate-50 border rounded-lg p-3 text-sm text-slate-600 flex gap-3 mb-4">
            <MessageSquare className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p>I can help you write, rewrite, and optimize your resume. Just ask!</p>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t bg-slate-50 shrink-0">
        <div className="relative">
          <textarea 
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-h-[80px] resize-none pr-10"
            placeholder="Ask AI to write a summary, add bullet points..."
          ></textarea>
          <Button size="icon" className="absolute bottom-2 right-2 h-8 w-8 rounded bg-indigo-600 hover:bg-indigo-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
