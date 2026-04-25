'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Target, Bot, Settings, Sparkles, LogOut
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',             href: '/' },
  { icon: FileText,        label: 'Resume ATS Simulation', href: '/ats' },
  { icon: Target,          label: 'Job Success Probability',href: '/probability' },
  { icon: Bot,             label: 'AI Recruiter',          href: '/recruiter' },
  { icon: Sparkles,        label: 'Skill Gap Optimizer',   href: '/skills' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-surface border-r border-surfaceHighlight flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2 text-xl font-bold text-textMain">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span>CareerOS</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-4 mt-4 px-2">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-textMuted hover:bg-surfaceHighlight hover:text-textMain'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-full bg-primary rounded-r-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon
                size={20}
                className={clsx('transition-colors', isActive ? 'text-primary' : 'group-hover:text-textMain')}
              />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-surfaceHighlight">
        <div className="space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-textMuted hover:bg-surfaceHighlight hover:text-textMain transition-colors"
          >
            <Settings size={20} />
            <span className="font-medium text-sm">Settings</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-textMuted hover:bg-danger/10 hover:text-danger transition-colors">
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
