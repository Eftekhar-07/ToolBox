import React from 'react';
import { Search, Moon, Sun, ShieldCheck } from 'lucide-react';
import { ThemeMode } from '../../types';

interface HeaderProps {
  onOpenSearch: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, theme, onToggleTheme }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl px-4 pt-3 pb-3 border-b border-white/50 dark:border-white/10 transition-colors shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 backdrop-blur-sm">
              <ShieldCheck size={12} />
              Offline & Private
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {getGreeting()} 👋
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">What do you need today?</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border border-white/60 dark:border-white/10 shadow-xs hover:bg-white/70 dark:hover:bg-slate-700/60 backdrop-blur-md transition-all active:scale-95"
            title="Search Tools, Habits & Routines"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border border-white/60 dark:border-white/10 shadow-xs hover:bg-white/70 dark:hover:bg-slate-700/60 backdrop-blur-md transition-all active:scale-95"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
