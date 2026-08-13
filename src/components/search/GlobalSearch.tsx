import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Star, CheckCircle2, ListTodo, Wrench, ArrowRight } from 'lucide-react';
import { ALL_TOOLS } from '../../data/toolsData';
import { Habit, Routine, ToolItem } from '../../types';
import { IconHelper } from '../common/IconHelper';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  routines: Routine[];
  favorites: string[];
  onSelectTool: (toolId: string) => void;
  onSelectHabit: () => void;
  onSelectRoutine: (routineId: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  habits,
  routines,
  favorites,
  onSelectTool,
  onSelectHabit,
  onSelectRoutine,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();

  const matchingTools = ALL_TOOLS.filter((t) => {
    if (!cleanQuery) return t.isPopular;
    return (
      t.name.toLowerCase().includes(cleanQuery) ||
      t.description.toLowerCase().includes(cleanQuery) ||
      t.keywords.some((k) => k.toLowerCase().includes(cleanQuery))
    );
  });

  const matchingHabits = habits.filter((h) => {
    if (!cleanQuery) return false;
    return (
      h.name.toLowerCase().includes(cleanQuery) ||
      (h.description && h.description.toLowerCase().includes(cleanQuery))
    );
  });

  const matchingRoutines = routines.filter((r) => {
    if (!cleanQuery) return false;
    return (
      r.name.toLowerCase().includes(cleanQuery) ||
      (r.description && r.description.toLowerCase().includes(cleanQuery)) ||
      r.steps.some((s) => s.title.toLowerCase().includes(cleanQuery))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex flex-col p-4 sm:p-6 animate-fade-in">
      <div className="max-w-md w-full mx-auto frosted-card rounded-[2.25rem] shadow-2xl border border-white/50 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Bar Input */}
        <div className="p-3 border-b border-white/30 dark:border-white/10 flex items-center gap-2">
          <Search className="text-slate-400 ml-2" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, kg, pdf, timer, morning..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-hidden py-1.5 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-lg"
          >
            Close
          </button>
        </div>

        {/* Results Body */}
        <div className="p-3 overflow-y-auto space-y-4 flex-1">
          {!cleanQuery && (
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2">
              Popular Quick Tools
            </div>
          )}

          {/* Tools List */}
          {matchingTools.length > 0 && (
            <div>
              {cleanQuery && (
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1">
                  <Wrench size={12} /> Tools ({matchingTools.length})
                </div>
              )}
              <div className="space-y-1">
                {matchingTools.map((tool: ToolItem) => {
                  const isFav = favorites.includes(tool.id);
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        onSelectTool(tool.id);
                        onClose();
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-50/80 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100/70 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                          <IconHelper name={tool.icon} size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                            {tool.name}
                            {isFav && <Star size={12} className="fill-amber-400 text-amber-400" />}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {tool.description}
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Habits Match */}
          {matchingHabits.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1">
                <CheckCircle2 size={12} /> Habits ({matchingHabits.length})
              </div>
              <div className="space-y-1">
                {matchingHabits.map((habit) => (
                  <button
                    key={habit.id}
                    onClick={() => {
                      onSelectHabit();
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50/80 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100/70 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        <IconHelper name={habit.icon} size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {habit.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Habit Tracker
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Routines Match */}
          {matchingRoutines.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1">
                <ListTodo size={12} /> Routines ({matchingRoutines.length})
              </div>
              <div className="space-y-1">
                {matchingRoutines.map((routine) => (
                  <button
                    key={routine.id}
                    onClick={() => {
                      onSelectRoutine(routine.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-purple-50/80 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100/70 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                        <IconHelper name={routine.icon} size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {routine.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {routine.steps.length} steps routine
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-purple-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {cleanQuery &&
            matchingTools.length === 0 &&
            matchingHabits.length === 0 &&
            matchingRoutines.length === 0 && (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                <p className="text-sm">No results found for &quot;{query}&quot;</p>
                <p className="text-xs mt-1 text-slate-400">Try searching for kg, pdf, timer, habit, or calculator</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
