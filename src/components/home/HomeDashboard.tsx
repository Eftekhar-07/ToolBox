import React from 'react';
import { Habit, HabitLog, Routine, ToolItem } from '../../types';
import { ALL_TOOLS } from '../../data/toolsData';
import { IconHelper } from '../common/IconHelper';
import { CheckCircle2, Star, Clock, Play, Plus, ArrowRight, Sparkles, Check } from 'lucide-react';
import { soundEffects } from '../../utils/audio';
import { isHabitScheduledOnDate } from '../../utils/habitAnalytics';

interface HomeDashboardProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  routines: Routine[];
  favorites: string[];
  recentTools: string[];
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onToggleHabit: (habitId: string) => void;
  onOpenTool: (toolId: string) => void;
  onNavigateTab: (tab: 'tools' | 'habits' | 'routines') => void;
  onStartRoutine: (routineId: string) => void;
  onToggleFavorite: (toolId: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  habits,
  habitLogs,
  routines,
  favorites,
  recentTools,
  soundEnabled,
  hapticsEnabled,
  onToggleHabit,
  onOpenTool,
  onNavigateTab,
  onStartRoutine,
  onToggleFavorite,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Active unarchived habits scheduled for today
  const activeHabits = habits.filter((h) => !h.archived);
  const todayScheduledHabits = activeHabits.filter((h) => isHabitScheduledOnDate(h, todayStr));
  
  const completedHabitsCount = todayScheduledHabits.filter((h) => {
    const log = habitLogs.find((l) => l.habitId === h.id && l.date === todayStr);
    return log?.completed;
  }).length;

  const totalHabitsCount = todayScheduledHabits.length;
  const habitProgressPct = totalHabitsCount > 0 ? Math.round((completedHabitsCount / totalHabitsCount) * 100) : 0;

  // Favorite Tools
  const favoriteToolsList = ALL_TOOLS.filter((t) => favorites.includes(t.id));

  // Recent Tools
  const recentToolsList = ALL_TOOLS.filter((t) => recentTools.includes(t.id));

  // Default Quick Tools if favorites/recents empty
  const defaultQuickTools = ALL_TOOLS.filter((t) => t.isPopular).slice(0, 6);

  const handleHabitCheck = (habitId: string) => {
    soundEffects.playTap(soundEnabled);
    soundEffects.vibrate(hapticsEnabled, 15);
    onToggleHabit(habitId);
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* TODAY'S PROGRESS CARD */}
      <section className="bg-gradient-to-br from-indigo-600/90 via-purple-600/90 to-indigo-800/90 dark:from-indigo-900/80 dark:via-purple-950/80 dark:to-slate-900/90 text-white rounded-[2rem] p-5 shadow-xl border border-white/30 dark:border-white/10 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-100">
              Today&apos;s Progress
            </span>
            <h2 className="text-2xl font-black tracking-tight mt-0.5">
              {completedHabitsCount} / {totalHabitsCount} Habits Done
            </h2>
          </div>
          <div className="w-14 h-14 rounded-full border border-white/40 flex items-center justify-center bg-white/20 backdrop-blur-md shadow-inner">
            <span className="text-sm font-bold">{habitProgressPct}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/25 h-2.5 rounded-full overflow-hidden mb-4 p-0.5 border border-white/10">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${habitProgressPct}%` }}
          />
        </div>

        {/* Quick Habit Chips */}
        {activeHabits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {activeHabits.slice(0, 4).map((habit) => {
              const log = habitLogs.find((l) => l.habitId === habit.id && l.date === todayStr);
              const isCompleted = !!log?.completed;

              return (
                <button
                  key={habit.id}
                  onClick={() => handleHabitCheck(habit.id)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl transition-all border text-left backdrop-blur-md ${
                    isCompleted
                      ? 'bg-emerald-500/25 border-emerald-300/50 text-emerald-100 shadow-xs'
                      : 'bg-white/15 border-white/20 hover:bg-white/25 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-xl bg-white/20 backdrop-blur-xs">
                      <IconHelper name={habit.icon} size={16} />
                    </div>
                    <span className="text-xs font-medium truncate">{habit.name}</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      isCompleted
                        ? 'bg-emerald-400 border-emerald-300 text-slate-900 shadow-xs'
                        : 'border-white/50'
                    }`}
                  >
                    {isCompleted && <Check size={12} className="stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-2 text-indigo-100 text-xs font-medium">
            No habits created yet. Tap below to build your routine!
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20 text-xs">
          <button
            onClick={() => onNavigateTab('habits')}
            className="text-indigo-100 hover:text-white flex items-center gap-1 font-medium"
          >
            Manage Habits <ArrowRight size={14} />
          </button>
          <button
            onClick={() => onNavigateTab('habits')}
            className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold flex items-center gap-1 backdrop-blur-md border border-white/30 shadow-xs transition-all active:scale-95"
          >
            <Plus size={14} /> Add Habit
          </button>
        </div>
      </section>

      {/* TODAY'S ROUTINES */}
      <section className="frosted-card rounded-[2rem] p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 backdrop-blur-md">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Today&apos;s Routines</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Guided focus schedules</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('routines')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View All
          </button>
        </div>

        {routines.length > 0 ? (
          <div className="space-y-2.5">
            {routines.slice(0, 2).map((routine) => (
              <div
                key={routine.id}
                className="frosted-subcard p-3.5 rounded-2xl flex items-center justify-between hover:border-purple-400/50 transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${routine.color} text-white shadow-xs`}>
                    <IconHelper name={routine.icon} size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {routine.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {routine.steps.length} steps • {routine.startTime || 'Flexible'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onStartRoutine(routine.id)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-transform active:scale-95"
                >
                  <Play size={14} className="fill-white" /> Start
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-xs">
            No routines set. Tap Routines tab to import templates!
          </div>
        )}
      </section>

      {/* FAVORITE TOOLS */}
      {favoriteToolsList.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Star size={18} className="text-amber-400 fill-amber-400" /> Favorites
            </h3>
            <button
              onClick={() => onNavigateTab('tools')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              All Tools
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {favoriteToolsList.map((tool) => (
              <div
                key={tool.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenTool(tool.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenTool(tool.id);
                  }
                }}
                className="frosted-card p-3.5 rounded-2xl shadow-xs hover:shadow-lg hover:border-indigo-400/50 transition-all text-left group flex flex-col justify-between min-h-[90px] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform backdrop-blur-xs">
                    <IconHelper name={tool.icon} size={20} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(tool.id);
                    }}
                    className="text-amber-400 hover:scale-110 p-1"
                  >
                    <Star size={16} className="fill-amber-400" />
                  </button>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-2">
                    {tool.name}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                    {tool.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* QUICK POPULAR TOOLS */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CheckCircle2 size={18} className="text-indigo-600 dark:text-indigo-400" /> Popular Tools
          </h3>
          <button
            onClick={() => onNavigateTab('tools')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Explore 35+
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {defaultQuickTools.map((tool) => {
            const isFav = favorites.includes(tool.id);
            return (
              <div
                key={tool.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenTool(tool.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenTool(tool.id);
                  }
                }}
                className="frosted-card p-3.5 rounded-2xl shadow-xs hover:shadow-lg hover:border-indigo-400/50 transition-all text-left group flex flex-col justify-between min-h-[95px] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-200 group-hover:bg-indigo-500/20 group-hover:text-indigo-600 transition-colors">
                    <IconHelper name={tool.icon} size={20} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(tool.id);
                    }}
                    className="text-slate-300 dark:text-slate-600 hover:text-amber-400 p-1"
                  >
                    <Star size={16} className={isFav ? 'fill-amber-400 text-amber-400' : ''} />
                  </button>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-2">
                    {tool.name}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                    {tool.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RECENTLY USED */}
      {recentToolsList.length > 0 && (
        <section className="frosted-card rounded-[2rem] p-4 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <Clock size={14} /> Recently Used
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {recentToolsList.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onOpenTool(tool.id)}
                className="frosted-subcard px-3 py-2 rounded-xl flex items-center gap-2 shrink-0 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors shadow-xs"
              >
                <IconHelper name={tool.icon} size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  {tool.name}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
