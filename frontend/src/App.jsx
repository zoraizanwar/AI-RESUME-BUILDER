import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { DesignSystemShowcase } from './pages/DesignSystemShowcase';
import { LandingPage } from './pages/LandingPage';
import { ResumeEditor } from './pages/ResumeEditor';
import { TemplateGallery } from './pages/TemplateGallery';
import { AtsAnalyzer } from './pages/AtsAnalyzer';
import { JobMatcher } from './pages/JobMatcher';
import { AiAssistant } from './pages/AiAssistant';
import { ResumeUpload } from './pages/ResumeUpload';
import { InterviewPrep } from './pages/InterviewPrep';
import Login from './features/auth/Login';
import Register from './features/auth/Register';

// Dummy components for routes
const Placeholder = ({ title }) => <div className="p-8"><h1>{title}</h1></div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<LandingPage />} />
          <Route path="/design-system" element={<DesignSystemShowcase />} />
          
          {/* Full Screen App Routes (No Sidebar) */}
          <Route path="/app/resumes/:id/edit" element={<ResumeEditor />} />

          {/* Protected Dashboard Routes (With Sidebar) */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<ResumeUpload />} />
            <Route path="resumes" element={<Placeholder title="My Resumes" />} />
            <Route path="templates" element={<TemplateGallery />} />
            <Route path="ats-analyzer" element={<AtsAnalyzer />} />
            <Route path="job-matcher" element={<JobMatcher />} />
            <Route path="ai-assistant" element={<AiAssistant />} />
            <Route path="interview-prep" element={<InterviewPrep />} />
            <Route path="settings" element={<Placeholder title="Settings" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
