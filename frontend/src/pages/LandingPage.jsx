import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { 
  Sparkles, FileText, CheckCircle2, Zap, Briefcase, 
  Search, Shield, Layers, LayoutTemplate, ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      
      {/* 1. Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">ResumeAI</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#templates" className="hover:text-foreground transition-colors">Templates</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/app">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block">
                  Sign In
                </Link>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        
        {/* 2 & 3. Hero & Visual Preview */}
        <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" style={{ backgroundSize: '30px 30px', backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)' }}></div>
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium rounded-full border bg-white/50 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                The Next Generation of Resume Building
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
                Build a Resume That <span className="text-primary">Gets Noticed.</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Create, optimize and tailor your resume with AI while keeping your experience and information accurate. Land your dream job faster.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                    Create My Resume
                  </Button>
                </Link>
                <Link to="/templates">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                    Explore Templates
                  </Button>
                </Link>
              </div>
            </div>

            {/* Resume Editor Visual Preview */}
            <div className="mt-20 mx-auto max-w-5xl rounded-xl border bg-background/50 p-2 shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 fill-mode-both">
              <div className="rounded-lg border bg-card overflow-hidden flex flex-col md:flex-row shadow-sm">
                {/* Editor Sidebar Mock */}
                <div className="w-full md:w-64 bg-muted/30 border-r p-4 space-y-4 hidden sm:block">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 bg-background rounded border flex items-center px-3 text-xs font-medium text-primary border-primary/20">Personal Info</div>
                    <div className="h-8 bg-muted rounded border-transparent flex items-center px-3 text-xs text-muted-foreground">Professional Summary</div>
                    <div className="h-8 bg-muted rounded border-transparent flex items-center px-3 text-xs text-muted-foreground">Work Experience</div>
                    <div className="h-8 bg-muted rounded border-transparent flex items-center px-3 text-xs text-muted-foreground">Education</div>
                  </div>
                </div>
                {/* Editor Document Mock */}
                <div className="flex-1 p-8 bg-slate-100 flex items-center justify-center min-h-[400px]">
                  <div className="bg-white w-full max-w-lg aspect-[1/1.4] shadow-md rounded-sm p-8 space-y-6 transform transition-transform hover:scale-[1.02] duration-300">
                    <div className="space-y-2 border-b pb-4">
                      <div className="h-6 w-1/3 bg-slate-800 rounded"></div>
                      <div className="h-3 w-1/2 bg-slate-300 rounded"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-1/4 bg-slate-800 rounded mb-4"></div>
                      <div className="h-2 w-full bg-slate-200 rounded"></div>
                      <div className="h-2 w-5/6 bg-slate-200 rounded"></div>
                      <div className="h-2 w-4/6 bg-slate-200 rounded"></div>
                    </div>
                    <div className="space-y-3 pt-4">
                      <div className="h-3 w-1/4 bg-slate-800 rounded mb-4"></div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="h-3 w-1/3 bg-slate-600 rounded"></div>
                        <div className="h-2 w-16 bg-slate-300 rounded"></div>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded"></div>
                      <div className="h-2 w-full bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
                {/* AI Panel Mock */}
                <div className="w-full md:w-72 bg-background border-l p-4 hidden lg:block">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">AI Suggestions</span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg bg-primary/5 border-primary/20 space-y-2">
                      <p className="text-xs font-medium text-primary">Enhance Summary</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">Your summary is strong, but could highlight your leadership experience more prominently.</p>
                      <Button size="sm" className="w-full h-7 text-xs mt-2">Apply Suggestion</Button>
                    </div>
                    <div className="p-3 border rounded-lg space-y-2">
                      <p className="text-xs font-medium">ATS Keyword Check</p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        <span className="px-2 py-0.5 bg-success/10 text-success text-[10px] rounded">React</span>
                        <span className="px-2 py-0.5 bg-warning/10 text-warning text-[10px] rounded border border-warning/20">TypeScript (Missing)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. AI Features */}
        <section id="features" className="py-24 bg-surface">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Intelligent Resume Building</h2>
              <p className="text-muted-foreground text-lg">Powerful AI tools seamlessly integrated into a professional editor, designed to enhance your authentic experience.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: "Smart Generation", desc: "Generate professional summaries and bullet points based on your job title and brief notes." },
                { icon: Search, title: "ATS Optimization", desc: "Instantly analyze your resume against job descriptions to ensure you pass automated screening." },
                { icon: Shield, title: "Fact-Based AI", desc: "Our AI enhances your writing without inventing fake experience or hallucinating skills." }
              ].map((feature, i) => (
                <Card key={i} className="border-none shadow-sm bg-background transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 5. How it Works */}
        <section id="how-it-works" className="py-24 bg-background">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">From draft to dream job in minutes.</h2>
                  <p className="text-lg text-muted-foreground">A streamlined workflow designed to get you past the screening software and onto the interview desk.</p>
                </div>
                <div className="space-y-6">
                  {[
                    { num: "01", title: "Import or Start Fresh", desc: "Upload your existing resume to parse it instantly, or start with a blank slate." },
                    { num: "02", title: "Tailor & Refine", desc: "Use the live editor and AI suggestions to craft perfect bullet points and summaries." },
                    { num: "03", title: "Match & Export", desc: "Check against a target job description, apply missing keywords, and download a pixel-perfect PDF." }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center font-bold text-primary">
                        {step.num}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full relative">
                <div className="aspect-square bg-slate-100 rounded-2xl border flex items-center justify-center p-8 overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent"></div>
                   <div className="w-full max-w-md space-y-4 relative z-10">
                     <Card className="shadow-lg border-primary/20">
                       <CardHeader className="py-4 px-5 border-b bg-muted/30">
                         <CardTitle className="text-sm font-medium flex justify-between items-center">
                           <span>Job Description Analysis</span>
                           <Badge variant="success">92% Match</Badge>
                         </CardTitle>
                       </CardHeader>
                       <CardContent className="py-4 px-5 space-y-3">
                         <div className="flex justify-between items-center text-sm">
                           <span className="text-muted-foreground">Software Engineer - Stripe</span>
                           <CheckCircle2 className="w-4 h-4 text-success" />
                         </div>
                         <Progress value={92} className="h-2" />
                       </CardContent>
                     </Card>
                     <Card className="shadow-md ml-8 opacity-90 transform -rotate-2">
                       <CardContent className="p-4 flex items-center gap-3">
                         <Sparkles className="w-5 h-5 text-primary" />
                         <p className="text-sm font-medium">Added "Distributed Systems" to Skills</p>
                       </CardContent>
                     </Card>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Template Showcase */}
        <section id="templates" className="py-24 bg-surface">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Professional Templates</h2>
              <p className="text-muted-foreground text-lg">Clean, ATS-friendly designs that stand out to human recruiters while remaining perfectly parseable by machines.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group relative rounded-xl border bg-background p-2 transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="aspect-[1/1.4] bg-slate-100 rounded-lg overflow-hidden relative border">
                    <div className="absolute inset-0 flex flex-col p-6 pointer-events-none">
                      {/* Abstract Resume Layouts */}
                      <div className="w-1/2 h-4 bg-slate-300 mb-2 rounded"></div>
                      <div className="w-1/3 h-2 bg-slate-200 mb-6 rounded"></div>
                      <div className="w-full h-px bg-slate-200 mb-4"></div>
                      <div className="flex-1 flex gap-4">
                         {i === 3 ? (
                           <>
                            <div className="w-1/3 space-y-2 border-r pr-4">
                              <div className="w-full h-2 bg-slate-200 rounded"></div>
                              <div className="w-4/5 h-2 bg-slate-200 rounded"></div>
                              <div className="w-full h-2 bg-slate-200 rounded mt-6"></div>
                            </div>
                            <div className="w-2/3 space-y-4">
                               <div className="w-1/3 h-3 bg-slate-300 rounded"></div>
                               <div className="w-full h-2 bg-slate-200 rounded"></div>
                               <div className="w-5/6 h-2 bg-slate-200 rounded"></div>
                            </div>
                           </>
                         ) : (
                           <div className="w-full space-y-4">
                              <div className="w-1/4 h-3 bg-slate-300 rounded"></div>
                              <div className="w-full h-2 bg-slate-200 rounded"></div>
                              <div className="w-5/6 h-2 bg-slate-200 rounded"></div>
                              <div className="w-1/4 h-3 bg-slate-300 rounded mt-6"></div>
                              <div className="w-full h-2 bg-slate-200 rounded"></div>
                           </div>
                         )}
                      </div>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button>Use Template</Button>
                    </div>
                  </div>
                  <div className="pt-4 pb-2 px-2 flex justify-between items-center">
                    <span className="font-medium">{['Modern Executive', 'Clean Professional', 'Creative Two-Column'][i-1]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7 & 8. ATS & Job Matching Showcase */}
        <section className="py-24 bg-background border-t">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
             <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium rounded-full border">
                Built-in ATS Analyzer
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto">
                Stop guessing. Start matching.
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Paste your target job description and let our semantic matching engine identify exactly which keywords you're missing.
              </p>
              
              <div className="mt-16 bg-card border rounded-2xl p-8 md:p-12 max-w-4xl mx-auto shadow-sm flex flex-col md:flex-row gap-8 items-center text-left">
                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Target: Product Manager</h3>
                    <p className="text-muted-foreground">Your resume is a strong fit, but missing a few key phrases the ATS is looking for.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="font-medium">Agile Methodologies</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="font-medium">Cross-functional Leadership</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-50">
                      <div className="w-5 h-5 rounded-full border-2 border-warning flex items-center justify-center text-[10px] font-bold text-warning">!</div>
                      <span className="font-medium line-through">Go-to-Market Strategy</span>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4"><Sparkles className="w-4 h-4 mr-2" /> Auto-integrate Missing Keywords</Button>
                </div>
                <div className="w-48 h-48 rounded-full border-8 border-success/20 flex items-center justify-center relative">
                   <div className="absolute inset-0 rounded-full border-8 border-success border-l-transparent border-b-transparent transform rotate-45"></div>
                   <div className="text-center">
                     <span className="text-4xl font-bold text-success">85%</span>
                     <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Match Score</p>
                   </div>
                </div>
              </div>
          </div>
        </section>

        {/* 9. Testimonials Placeholder */}
        <section className="py-24 bg-surface border-t">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Trusted by professionals worldwide</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-background shadow-sm border-none">
                  <CardHeader className="pb-4">
                    <div className="flex gap-1 mb-2">
                      {[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-lg">★</span>)}
                    </div>
                    <CardDescription className="text-base text-foreground leading-relaxed italic">
                      "The AI suggestions were incredibly natural. It didn't feel like a robot wrote my resume, it just felt like a highly polished version of my own experience. Landed interviews within a week."
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium border">
                      {['JS', 'MK', 'AL'][i-1]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Verified User</p>
                      <p className="text-xs text-muted-foreground">Hired in {['Tech', 'Finance', 'Healthcare'][i-1]}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 10. FAQ */}
        <section id="faq" className="py-24 bg-background border-t">
          <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                { q: "Is the AI going to make up fake experience?", a: "No. Our AI is strictly prompted to act as an editor and optimizer, not a fiction writer. It relies entirely on the facts you provide in your raw input." },
                { q: "Are the templates ATS-friendly?", a: "Yes. All our templates are designed with standard structural hierarchies that ensure Applicant Tracking Systems can perfectly parse your contact info, experience, and skills." },
                { q: "Can I export my resume to PDF or Word?", a: "Yes, you can export pixel-perfect PDFs immediately. DOCX export is available on premium plans to allow for manual tweaking." },
                { q: "How does the Job Matcher work?", a: "We use semantic analysis to compare the text of your resume against a provided job description, calculating a match score and highlighting exact keywords you are missing." }
              ].map((faq, i) => (
                <div key={i} className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 11. Final CTA */}
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to upgrade your career?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of professionals who have successfully navigated the modern hiring landscape with ResumeAI.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold">
                  Create My Resume Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 12. Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold">ResumeAI</span>
              </div>
              <p className="text-sm text-muted-foreground">The intelligent resume builder for modern professionals.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#templates" className="hover:text-foreground">Templates</a></li>
                <li><Link to="/app/ats-analyzer" className="hover:text-foreground">ATS Analyzer</Link></li>
                <li><Link to="/design-system" className="hover:text-foreground">Design System</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Career Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Resume Examples</a></li>
                <li><a href="#faq" className="hover:text-foreground">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About Us</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground">Twitter</a>
              <a href="#" className="hover:text-foreground">LinkedIn</a>
              <a href="#" className="hover:text-foreground">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
