import React from 'react';
import { TabType } from '../../types';
import { Home, Wrench, CheckCircle2, ListTodo, Settings } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  soundEnabled = true,
  hapticsEnabled = true,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'habits', label: 'Habits', icon: CheckCircle2 },
    { id: 'routines', label: 'Routines', icon: ListTodo },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (id: TabType) => {
    if (activeTab !== id) {
      soundEffects.playTap(soundEnabled);
      soundEffects.vibrate(hapticsEnabled, 10);
      onTabChange(id);
    }
  };

  return (
    <nav className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 px-3 sm:px-4 max-w-md mx-auto pointer-events-none transform-gpu">
      <div className="frosted-nav rounded-[2rem] p-1.5 flex justify-around items-center pointer-events-auto ring-1 ring-black/5 dark:ring-white/10 transition-all duration-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-12 rounded-[1.5rem] transition-all duration-200 relative group cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 dark:shadow-indigo-900/40 font-bold scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-slate-800/40 font-medium'
              }`}
            >
              <Icon size={18} className="transition-transform duration-200 group-active:scale-90" />
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
