import React from 'react';
import { User, Bell } from 'lucide-react';
import { Button } from '../ui/button';

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button would go here */}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
