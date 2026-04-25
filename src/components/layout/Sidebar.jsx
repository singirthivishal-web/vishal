import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Target, 
  Bot, 
  Settings, 
  Sparkles,
  LogOut,
  User
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FileText, label: 'Resume ATS Simulation', path: '/ats' },
  { icon: Target, label: 'Job Success Probability', path: '/probability' },
  { icon: Bot, label: 'AI Recruiter', path: '/recruiter' },
  { icon: Sparkles, label: 'Skill Gap Optimizer', path: '/skills' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 h-screen bg-surface border-r border-surfaceHighlight flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 text-xl font-bold text-textMain">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span>CareerOS</span>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-4 mt-4 px-2">
          Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-textMuted hover:bg-surfaceHighlight hover:text-textMain'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-full bg-primary rounded-r-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={20} className={clsx('transition-colors', isActive ? 'text-primary' : 'group-hover:text-textMain')} />
                <span className="font-medium text-sm">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-surfaceHighlight space-y-1">
        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-textMain truncate capitalize">{user.name}</p>
              <p className="text-[10px] text-textMuted truncate">{user.email}</p>
            </div>
          </div>
        )}

        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-textMuted hover:bg-surfaceHighlight hover:text-textMain transition-colors"
        >
          <Settings size={20} />
          <span className="font-medium text-sm">Settings</span>
        </NavLink>

        <button
          id="logout-button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-textMuted hover:bg-danger/10 hover:text-danger transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
