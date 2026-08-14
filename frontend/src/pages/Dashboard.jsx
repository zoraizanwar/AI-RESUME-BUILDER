import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { EmptyState } from '../components/ui/states';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { 
  Plus, Upload, LayoutTemplate, FileText, 
  MoreVertical, Edit, Trash2, Download,
  CheckCircle2, AlertCircle, Clock
} from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get('/resumes/');
        setResumes(res.data);
      } catch (err) {
        console.error("Failed to fetch resumes", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchResumes();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCreateNew = async () => {
    setCreating(true);
    try {
      const res = await api.post('/resumes/', {
        title: 'Untitled Resume'
      });
      navigate(`/app/resumes/${res.data.id}/edit`);
    } catch (err) {
      console.error("Failed to create resume", err);
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await api.delete(`/resumes/${id}/`);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back{user?.username ? `, ${user.username}` : ''}</h1>
          <p className="text-muted-foreground mt-1 font-medium">Here is what's happening with your job search.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex" onClick={() => navigate('/app/templates')}>
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Browse Templates
          </Button>
          <Button onClick={handleCreateNew} disabled={creating}>
            {creating ? (
              <span className="flex items-center"><div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" /> Creating...</span>
            ) : (
              <span className="flex items-center"><Plus className="w-4 h-4 mr-2" /> Create Resume</span>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Actions (Mobile mainly, or alternative paths) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all" onClick={handleCreateNew}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Create Resume</p>
              <p className="text-xs font-medium text-slate-500">Start from scratch</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all" onClick={() => navigate('/app/upload')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Upload Existing</p>
              <p className="text-xs font-medium text-slate-500">Parse a PDF or DOCX</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all" onClick={() => navigate('/app/templates')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <LayoutTemplate className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Browse Templates</p>
              <p className="text-xs font-medium text-slate-500">Find the perfect design</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Resumes</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{resumes.length}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ATS Score</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-success mt-1">+5% from last week</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Matches</CardTitle>
            <AlertCircle className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">12</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resume Completion</CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-16" /> : (
               <>
                 <div className="text-2xl font-bold">92%</div>
                 <div className="w-full bg-secondary h-1.5 rounded-full mt-2">
                   <div className="bg-primary h-1.5 rounded-full" style={{width: '92%'}}></div>
                 </div>
               </>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Resumes */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Resumes</h2>
        
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : resumes.length === 0 ? (
          <EmptyState 
            title="No resumes found"
            description="You haven't created any resumes yet. Start by creating a new one or uploading an existing document."
            action={<Button onClick={handleCreateNew}><Plus className="w-4 h-4 mr-2"/> Create First Resume</Button>}
          />
        ) : (
          <div className="grid gap-4">
            {resumes.map(resume => (
              <Card key={resume.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-16 bg-slate-100 rounded border flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg hover:text-primary cursor-pointer transition-colors" onClick={() => navigate(`/app/resumes/${resume.id}/edit`)}>
                        {resume.title || 'Untitled Resume'}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>Updated {new Date(resume.updated_at).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-border"></span>
                        <span>Template: Modern</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex flex-col items-end">
                       <span className="text-xs font-medium text-muted-foreground mb-1">ATS Score</span>
                       <Badge variant="success">Great (92%)</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => navigate(`/app/resumes/${resume.id}/edit`)}>
                        Edit
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/app/resumes/${resume.id}/edit`)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" /> Export PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(resume.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
