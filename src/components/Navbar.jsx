import React from 'react';
import { Search, LogOut, Layout } from 'lucide-react';
import { useTaskStore } from '../context/useTaskStore';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { searchTerm, setSearchTerm } = useTaskStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <nav className="bg-surface border-b border-secondary/30 px-6 py-4 flex items-center justify-between sticky top-0 z-10 w-full">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <Layout className="w-6 h-6 text-primary" />
        <span className="text-xl font-bold tracking-wide text-textMain hidden sm:block">Trello<span className="text-primary">Clone</span></span>
      </div>

      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-textMuted" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-secondary/50 rounded-md leading-5 bg-background placeholder-textMuted text-textMain focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors duration-200"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-background text-textMuted hover:text-textMain transition-colors duration-200"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
