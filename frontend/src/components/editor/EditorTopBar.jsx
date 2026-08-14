import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cloud, Check, Loader2, Download, Monitor, ZoomIn, ZoomOut, Undo, Redo, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useEditorStore } from '../../store/useEditorStore';
import { DownloadDialog } from './DownloadDialog';

export function EditorTopBar({ resumeTitle, saveStatus, onSave, onTitleChange }) {
  const navigate = useNavigate();
  const { zoomLevel, setZoom } = useEditorStore();

  const handleZoomIn = () => setZoom(zoomLevel + 10);
  const handleZoomOut = () => setZoom(zoomLevel - 10);

  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
      
      {/* Left side: Navigation and Title */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/resumes')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col">
          <input 
            type="text" 
            className="font-semibold text-sm outline-none border-b border-transparent hover:border-border focus:border-primary bg-transparent transition-colors p-0.5 min-w-[150px]"
            value={resumeTitle}
            onChange={(e) => onTitleChange && onTitleChange(e.target.value)}
          />
          <div className="flex items-center text-xs text-muted-foreground">
            {saveStatus === 'saving' && (
              <span className="flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving...</span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center text-success"><Check className="w-3 h-3 mr-1" /> Saved to cloud</span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="flex items-center text-amber-500"><Cloud className="w-3 h-3 mr-1 animate-pulse" /> Unsaved changes</span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center text-destructive"><Cloud className="w-3 h-3 mr-1" /> Offline</span>
            )}
          </div>
        </div>
      </div>

      {/* Center: Tools (Desktop only) */}
      <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-md">
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-sm text-muted-foreground">
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-sm text-muted-foreground">
          <Redo className="w-4 h-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-2"></div>
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-sm text-muted-foreground" onClick={handleZoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs font-medium w-12 text-center text-muted-foreground">{zoomLevel}%</span>
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-sm text-muted-foreground" onClick={handleZoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2">
        <select 
          className="hidden sm:block text-sm border-input rounded-md border p-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
          value={useEditorStore((state) => state.activeTemplate)}
          onChange={(e) => useEditorStore.getState().setTemplate(e.target.value)}
        >
          <option value="modern-blue">Modern Blue</option>
          <option value="minimal">Minimal</option>
          <option value="executive">Executive</option>
          <option value="creative">Creative</option>
          <option value="ats-professional">ATS Professional</option>
          <option value="modern-two-column">Modern Two Column</option>
        </select>

        {onSave && (
          <Button variant="outline" size="sm" className="hidden sm:flex border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={onSave} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Cloud className="w-4 h-4 mr-2" /> Save</>
            )}
          </Button>
        )}

        <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => window.print()}>
          <Monitor className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <DownloadDialog resumeTitle={resumeTitle}>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DownloadDialog>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Change Template</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </div>
  );
}
