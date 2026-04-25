import React from 'react';
import { Bell, Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 border-b border-surfaceHighlight bg-background flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
          <input
            type="text"
            placeholder="Search resumes, jobs, or skills..."
            className="w-full bg-surface border border-surfaceHighlight rounded-lg py-2 pl-10 pr-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-textMuted hover:text-textMain hover:bg-surfaceHighlight rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-accent to-primary p-[2px]">
          <div className="w-full h-full rounded-full border-2 border-background overflow-hidden">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="User Avatar"
              className="w-full h-full object-cover bg-surface"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
