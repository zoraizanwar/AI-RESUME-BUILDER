import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Send, Bot, User, Copy, RotateCcw, 
  Sparkles, ChevronDown, CheckCircle2, MoreVertical,
  FileUp, FileCheck, Download, Loader2, RefreshCw,
  Paperclip
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import api from '../services/api';

export function AiAssistant() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your professional career assistant. I can help you tailor your resume, optimize your experience for ATS systems, or completely rewrite sections to make them more impactful. Upload your CV here or ask a question to get started!"
    }
  ]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatFileInputRef = useRef(null);
  
  // Target section for optimization context
  const [selectedSection, setSelectedSection] = useState('Work Experience');
  const [copiedId, setCopiedId] = useState(null);

  // ATS Transform states
  const [cvFile, setCvFile] = useState(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformStep, setTransformStep] = useState('');
  const [transformError, setTransformError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const suggestedActions = [
    "Improve my summary",
    "Make my experience ATS-friendly",
    "Find missing keywords",
    "Make this more concise",
    "Improve my project description"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Securely download the document using authenticated api.get call to handle simple JWT auth
  const handleDownload = async (url, filename = 'ATS_Friendly_CV.docx') => {
    setIsDownloading(true);
    try {
      let cleanUrl = url;
      if (cleanUrl.startsWith('http')) {
        const parser = document.createElement('a');
        parser.href = cleanUrl;
        cleanUrl = parser.pathname;
      }
      if (cleanUrl.startsWith('/api/v1')) {
        cleanUrl = cleanUrl.substring(7); // Remove /api/v1 prefix
      }
      
      const response = await api.get(cleanUrl, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const downloadLink = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadLink;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadLink);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download CV file. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    // Add user message
    const newMsgId = Date.now();
    setMessages(prev => [...prev, { id: newMsgId, role: 'user', content: text }]);
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await api.post('/ai/chat/', {
        message: text,
        section: selectedSection
      });

      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: response.data.reply 
      }]);
    } catch (err) {
      console.error("AI Assistant error", err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your query. Please make sure the backend server is running and try again."
      }]);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Upload and transform file to ATS compliant format via sidebar
  const handleAtsTransform = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCvFile(file);
    setIsTransforming(true);
    setTransformError('');
    setDownloadUrl('');

    setTransformStep('Uploading CV file to server...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      setTimeout(() => {
        setTransformStep('AI: Extracting and parsing CV sections...');
      }, 1000);
      
      setTimeout(() => {
        setTransformStep('AI: Rewriting work experiences to use ATS action verbs...');
      }, 2500);

      setTimeout(() => {
        setTransformStep('AI: Formatting and compiling into standardized ATS template...');
      }, 4000);

      const res = await api.post('/ai/ats-transform/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setIsTransforming(false);
      setDownloadUrl(res.data.download_url);
    } catch (err) {
      console.error("ATS Transform failed", err);
      setIsTransforming(false);
      setTransformError(err.response?.data?.error || 'Failed to transform your CV. Please verify file format.');
    }
  };

  // Upload and transform file to ATS compliant format via chat
  const handleChatAttachment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userMsgId = Date.now();
    setMessages(prev => [...prev, { 
      id: userMsgId, 
      role: 'user', 
      content: `Uploaded CV: ${file.name}` 
    }]);

    setIsTyping(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/ai/ats-transform/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I have analyzed and optimized your CV "${file.name}". All formatting risks have been removed, experience descriptions have been rewritten using Google X-Y-Z action verb formulas, and your resume has been compiled into a clean ATS-friendly template. You can download the optimized CV below:`,
        downloadUrl: res.data.download_url
      }]);
    } catch (err) {
      console.error("Chat CV transform failed", err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Sorry, I failed to transform your CV "${file.name}". Please verify the file is a valid PDF or DOCX format.`
      }]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-theme(spacing.16))] flex flex-col p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Assistant & CV Transformer</h1>
          <p className="text-muted-foreground mt-1">Chat with your resumes, or instantly transform any CV into an ATS-friendly format.</p>
        </div>
        
        {/* Context Selectors */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm w-full lg:w-auto px-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0">Target Section:</span>
          <select 
            className="appearance-none bg-transparent border-none text-sm font-medium focus:outline-none focus:ring-0 cursor-pointer pr-4 text-indigo-600"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="Work Experience">Work Experience</option>
            <option value="Professional Summary">Professional Summary</option>
            <option value="Skills">Skills</option>
            <option value="Projects">Projects</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Chat vs ATS Transformer Widget */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chat Area - Occupies 2 columns */}
        <div className="lg:col-span-2 bg-white border rounded-xl shadow-sm flex flex-col overflow-hidden h-full">
          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                
                {/* Avatar Assistant */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl text-sm relative ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white border shadow-sm rounded-tl-sm text-slate-800'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    
                    {/* Inline Transformed Document Download Button */}
                    {msg.downloadUrl && (
                      <button 
                        onClick={() => handleDownload(msg.downloadUrl, `ATS_CV_${msg.id}.docx`)}
                        disabled={isDownloading}
                        className="mt-3 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow transition-colors disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Downloading...</>
                        ) : (
                          <><Download className="w-3.5 h-3.5" /> Download ATS CV (DOCX)</>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Assistant Message Actions */}
                  {msg.role === 'assistant' && msg.id !== 1 && (
                    <div className="flex items-center gap-2 mt-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-slate-500 hover:text-slate-700"
                        onClick={() => handleCopy(msg.id, msg.content)}
                      >
                        {copiedId === msg.id ? (
                          <><CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3 mr-1" /> Copy</>
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-slate-500 hover:text-slate-700"
                        onClick={() => handleSend("Regenerate response")}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" /> Regenerate
                      </Button>
                    </div>
                  )}
                </div>

                {/* Avatar User */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1">
                   <Sparkles className="w-4 h-4 text-indigo-600" />
                 </div>
                 <div className="bg-white border shadow-sm p-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-12">
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Actions & Input Area */}
          <div className="p-4 border-t bg-white shrink-0">
            
            {/* Suggested Actions */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {suggestedActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action)}
                  className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-full transition-colors border border-slate-200 shrink-0"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="relative flex items-center bg-white border shadow-sm rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
              <input
                type="text"
                className="flex-1 px-4 py-4 outline-none text-sm bg-transparent"
                placeholder="Ask the assistant or click paperclip to upload & transform your CV..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              
              {/* Hidden file input for chat attachment */}
              <input 
                type="file" 
                ref={chatFileInputRef} 
                accept=".pdf,.docx" 
                onChange={handleChatAttachment}
                className="hidden" 
              />
              
              <div className="flex items-center gap-1.5 pr-2">
                <Button 
                  onClick={() => chatFileInputRef.current.click()}
                  variant="ghost"
                  size="icon" 
                  className="w-10 h-10 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                
                <Button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  size="icon" 
                  className="w-10 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">ResumeAI uses the Excel jobs database to verify and tailor calculations.</span>
            </div>
          </div>
        </div>

        {/* ATS Transformer Sidebar Widget */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-xl border border-slate-800 shadow-xl flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-6 h-6 text-indigo-400 animate-pulse" />
              <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs">ATS Transformer</Badge>
            </div>
            
            <h3 className="text-xl font-bold tracking-tight text-white mb-2">Automated CV Parser</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Upload your existing non-ATS friendly resume (PDF or DOCX). Our AI will analyze the text, rewrite experience descriptions using active Google X-Y-Z formulas, and export it into a standardized, ATS-compliant DOCX file.
            </p>

            {/* Transform steps loading block */}
            {isTransforming && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 mb-6 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  <span className="text-sm font-semibold text-indigo-300">Transforming Resume...</span>
                </div>
                <p className="text-xs text-slate-400 transition-all">{transformStep}</p>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-indigo-500 h-full animate-[progress_5s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}

            {/* Errors display */}
            {transformError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg p-4 mb-6 text-xs leading-relaxed">
                <span className="font-semibold block mb-1">Transformation Failed</span>
                {transformError}
              </div>
            )}

            {/* Download transformed doc result container */}
            {downloadUrl && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl p-5 mb-6 text-center animate-in zoom-in duration-300">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FileCheck className="w-6 h-6 text-emerald-400" />
                  <span className="text-sm font-bold text-white">ATS CV Ready!</span>
                </div>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  We've successfully stripped formatting risks and optimized your keywords against the industry database.
                </p>
                <button 
                  onClick={() => handleDownload(downloadUrl, 'ATS_Optimized_Resume.docx')}
                  disabled={isDownloading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow transition-colors text-sm disabled:opacity-50"
                >
                  {isDownloading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Downloading...</>
                  ) : (
                    <><Download className="w-4 h-4" /> Download CV (DOCX)</>
                  )}
                </button>
              </div>
            )}

            {/* Dropzone File Upload Input */}
            {!isTransforming && !downloadUrl && (
              <div className="border border-dashed border-slate-700 hover:border-indigo-500/80 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl p-6 transition-all text-center cursor-pointer relative group">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".pdf,.docx" 
                  onChange={handleAtsTransform}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileUp className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 mx-auto mb-3 transition-colors" />
                <span className="block text-sm font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">Select or Drop CV</span>
                <span className="block text-xs text-slate-400">PDF or DOCX formats (Max 5MB)</span>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-slate-800 pt-6 flex justify-between items-center text-xs text-slate-400 shrink-0">
            <span>Powered by ResumeAI Parser</span>
            {downloadUrl && (
              <button 
                onClick={() => { setDownloadUrl(''); setCvFile(null); }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Upload Another
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
