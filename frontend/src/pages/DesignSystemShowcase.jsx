import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import { EmptyState, ErrorState } from '../components/ui/states';
import { Toast } from '../components/ui/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '../components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

import { Sparkles, Terminal, Bell, Settings, FileText, Download } from 'lucide-react';

export function DesignSystemShowcase() {
  const [showToast, setShowToast] = useState(false);

  return (
    <div className="container mx-auto py-12 px-6 max-w-6xl space-y-16">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">ResumeAI Design System</h1>
        <p className="text-xl text-muted-foreground">Premium component library and style guide.</p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Typography & Colors</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <h2 className="text-2xl font-semibold">Heading 2</h2>
            <h3 className="text-lg font-medium">Heading 3</h3>
            <p className="text-base text-foreground">Standard body text. Clean and readable.</p>
            <p className="text-sm text-muted-foreground">Small secondary text for metadata.</p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="h-24 w-24 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-medium shadow-sm">Primary</div>
            <div className="h-24 w-24 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-medium shadow-sm">Secondary</div>
            <div className="h-24 w-24 rounded-lg bg-background border text-foreground flex items-center justify-center font-medium shadow-sm">Background</div>
            <div className="h-24 w-24 rounded-lg bg-success text-success-foreground flex items-center justify-center font-medium shadow-sm">Success</div>
            <div className="h-24 w-24 rounded-lg bg-warning text-warning-foreground flex items-center justify-center font-medium shadow-sm">Warning</div>
            <div className="h-24 w-24 rounded-lg bg-destructive text-destructive-foreground flex items-center justify-center font-medium shadow-sm">Error</div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button variant="default" disabled>Disabled</Button>
          <Button variant="default"><Sparkles className="w-4 h-4 mr-2" /> AI Enhance</Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Inputs & Forms</h2>
        <div className="grid gap-8 md:grid-cols-2 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Summary</Label>
            <Textarea id="bio" placeholder="Write a brief summary..." />
          </div>
          <div className="space-y-2">
            <Label>Experience Level</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                <SelectItem value="senior">Senior (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Feedback (Alerts & Toasts)</h2>
        <div className="grid gap-4 max-w-2xl">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>Your resume is looking great. Add one more skill.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to parse the uploaded document.</AlertDescription>
          </Alert>
          <Alert variant="success">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>ATS Score improved by 15%!</AlertDescription>
          </Alert>
          
          <Button onClick={() => setShowToast(true)} className="w-fit">Show Toast Notification</Button>
          {showToast && (
            <div className="fixed bottom-4 right-4 z-50">
              <Toast title="Resume Saved" description="Your changes have been synced." onClose={() => setShowToast(false)} />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Cards & Badges</h2>
        <div className="flex gap-2 mb-6">
          <Badge variant="default">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">High Match</Badge>
          <Badge variant="warning">Missing Keyword</Badge>
        </div>
        
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Resume Summary</CardTitle>
            <CardDescription>AI-generated professional summary.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Experienced software engineer with a proven track record in developing scalable web applications...</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Discard</Button>
            <Button>Accept</Button>
          </CardFooter>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Overlays (Dialog, Sheet, Dropdown, Tooltip)</h2>
        <div className="flex flex-wrap gap-4 items-center">
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="John Doe" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Sidebar Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>AI Assistant</SheetTitle>
                <SheetDescription>Get suggestions for your resume.</SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <p className="text-sm text-muted-foreground">AI analysis content goes here...</p>
              </div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Options</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Resume Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><FileText className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
              <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Export PDF</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive"><Settings className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Progress & Loading</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">ATS Match Score</h3>
            <Progress value={85} />
            <p className="text-xs text-muted-foreground">85% Match</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Skeleton Loader</h3>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Empty & Error States</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <EmptyState 
            title="No resumes found" 
            description="You haven't created any resumes yet. Start by creating your first professional resume."
            action={<Button>Create Resume</Button>}
          />
          <ErrorState 
            title="Failed to load analysis" 
            description="We couldn't connect to the AI service. Please try again later."
            action={<Button variant="outline">Retry</Button>}
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Tabs</h2>
        <Tabs defaultValue="experience" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>
          <TabsContent value="experience" className="p-4 border rounded-md mt-2">
            <p className="text-sm text-muted-foreground">Work experience form fields go here.</p>
          </TabsContent>
          <TabsContent value="education" className="p-4 border rounded-md mt-2">
            <p className="text-sm text-muted-foreground">Education form fields go here.</p>
          </TabsContent>
          <TabsContent value="skills" className="p-4 border rounded-md mt-2">
            <p className="text-sm text-muted-foreground">Skills form fields go here.</p>
          </TabsContent>
        </Tabs>
      </section>
      
    </div>
  );
}
