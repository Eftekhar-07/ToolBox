import { useState, useEffect } from 'react';
import { TabType, UserPreferences, Habit, HabitLog, Routine } from './types';
import { Storage } from './utils/storage';
import { Header } from './components/layout/Header';
import { Navbar } from './components/layout/Navbar';
import { GlobalSearch } from './components/search/GlobalSearch';
import { HomeDashboard } from './components/home/HomeDashboard';
import { ToolsList } from './components/tools/ToolsList';
import { HabitsManager } from './components/habits/HabitsManager';
import { RoutinesManager } from './components/routines/RoutinesManager';
import { SettingsManager } from './components/settings/SettingsManager';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [activeExecutionRoutineId, setActiveExecutionRoutineId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Persistent States
  const [preferences, setPreferences] = useState<UserPreferences>(() => Storage.getPreferences());
  const [habits, setHabits] = useState<Habit[]>(() => Storage.getHabits());
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() => Storage.getHabitLogs());
  const [routines, setRoutines] = useState<Routine[]>(() => Storage.getRoutines());

  // Apply Theme Mode (Dark/Light/System)
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (preferences.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System mode
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [preferences.theme]);

  // Save changes to storage
  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    Storage.savePreferences(newPrefs);
  };

  const handleToggleFavorite = (toolId: string) => {
    const isFav = preferences.favorites.includes(toolId);
    const updatedFavs = isFav
      ? preferences.favorites.filter((id) => id !== toolId)
      : [...preferences.favorites, toolId];
    handleUpdatePreferences({ ...preferences, favorites: updatedFavs });
  };

  const handleOpenTool = (toolId: string) => {
    // Add to recents
    const filteredRecents = preferences.recentTools.filter((id) => id !== toolId);
    const updatedRecents = [toolId, ...filteredRecents].slice(0, 10);
    handleUpdatePreferences({ ...preferences, recentTools: updatedRecents });

    setSelectedToolId(toolId);
    setActiveTab('tools');
  };

  // Habit Handlers
  const handleSaveHabit = (habitToSave: Habit) => {
    const existingIdx = habits.findIndex((h) => h.id === habitToSave.id);
    let updated: Habit[];
    if (existingIdx >= 0) {
      updated = [...habits];
      updated[existingIdx] = habitToSave;
    } else {
      updated = [habitToSave, ...habits];
    }
    setHabits(updated);
    Storage.saveHabits(updated);
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    Storage.saveHabits(updated);
  };

  const handleToggleHabitLog = (habitId: string, targetDate?: string, customValue?: number) => {
    const dateStr = targetDate || new Date().toISOString().split('T')[0];
    const existingLogIdx = habitLogs.findIndex((l) => l.habitId === habitId && l.date === dateStr);

    let updatedLogs: HabitLog[];
    if (existingLogIdx >= 0) {
      updatedLogs = [...habitLogs];
      const existing = updatedLogs[existingLogIdx];
      const nextCompleted = customValue !== undefined ? customValue > 0 : !existing.completed;
      updatedLogs[existingLogIdx] = {
        ...existing,
        completed: nextCompleted,
        currentValue: customValue !== undefined ? customValue : (nextCompleted ? existing.currentValue || 1 : 0),
      };
    } else {
      const isCompleted = customValue !== undefined ? customValue > 0 : true;
      updatedLogs = [
        ...habitLogs,
        {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          habitId,
          date: dateStr,
          completed: isCompleted,
          currentValue: customValue !== undefined ? customValue : 1,
        },
      ];
    }
    setHabitLogs(updatedLogs);
    Storage.saveHabitLogs(updatedLogs);
  };

  // Routine Handlers
  const handleSaveRoutine = (routineToSave: Routine) => {
    const existingIdx = routines.findIndex((r) => r.id === routineToSave.id);
    let updated: Routine[];
    if (existingIdx >= 0) {
      updated = [...routines];
      updated[existingIdx] = routineToSave;
    } else {
      updated = [routineToSave, ...routines];
    }
    setRoutines(updated);
    Storage.saveRoutines(updated);
  };

  const handleDeleteRoutine = (id: string) => {
    const updated = routines.filter((r) => r.id !== id);
    setRoutines(updated);
    Storage.saveRoutines(updated);
  };

  const handleReloadAllData = () => {
    setPreferences(Storage.getPreferences());
    setHabits(Storage.getHabits());
    setHabitLogs(Storage.getHabitLogs());
    setRoutines(Storage.getRoutines());
  };

  return (
    <div className="min-h-screen bg-frosted-radial text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Mobile Frame Container with Glass Effect */}
      <div className="max-w-md mx-auto min-h-screen bg-white/20 dark:bg-slate-950/40 backdrop-blur-3xl border-x border-white/50 dark:border-white/10 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          theme={preferences.theme}
          onToggleTheme={() => {
            const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
            handleUpdatePreferences({ ...preferences, theme: nextTheme });
          }}
        />

        {/* Global Search Overlay */}
        <GlobalSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          habits={habits}
          routines={routines}
          favorites={preferences.favorites}
          onSelectTool={(id) => handleOpenTool(id)}
          onSelectHabit={() => setActiveTab('habits')}
          onSelectRoutine={(id) => {
            setActiveExecutionRoutineId(id);
            setActiveTab('routines');
          }}
        />

        {/* Main Tab Content View */}
        <main className="flex-1 p-4 pb-28 sm:pb-32 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeDashboard
              habits={habits}
              habitLogs={habitLogs}
              routines={routines}
              favorites={preferences.favorites}
              recentTools={preferences.recentTools}
              soundEnabled={preferences.soundEnabled}
              hapticsEnabled={preferences.hapticsEnabled}
              onToggleHabit={handleToggleHabitLog}
              onOpenTool={handleOpenTool}
              onNavigateTab={(tab) => {
                if (tab === 'tools') setSelectedToolId(null);
                setActiveTab(tab);
              }}
              onStartRoutine={(id) => {
                setActiveExecutionRoutineId(id);
                setActiveTab('routines');
              }}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {activeTab === 'tools' && (
            <ToolsList
              selectedToolId={selectedToolId}
              onSelectTool={setSelectedToolId}
              favorites={preferences.favorites}
              onToggleFavorite={handleToggleFavorite}
              precision={preferences.decimalPrecision}
              soundEnabled={preferences.soundEnabled}
            />
          )}

          {activeTab === 'habits' && (
            <HabitsManager
              habits={habits}
              habitLogs={habitLogs}
              soundEnabled={preferences.soundEnabled}
              hapticsEnabled={preferences.hapticsEnabled}
              onSaveHabit={handleSaveHabit}
              onDeleteHabit={handleDeleteHabit}
              onToggleHabitLog={handleToggleHabitLog}
            />
          )}

          {activeTab === 'routines' && (
            <RoutinesManager
              routines={routines}
              habits={habits}
              soundEnabled={preferences.soundEnabled}
              hapticsEnabled={preferences.hapticsEnabled}
              activeExecutionRoutineId={activeExecutionRoutineId}
              onSaveRoutine={handleSaveRoutine}
              onDeleteRoutine={handleDeleteRoutine}
              onCloseExecution={() => setActiveExecutionRoutineId(null)}
              onToggleHabitLog={handleToggleHabitLog}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsManager
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
              onDataRestored={handleReloadAllData}
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'tools') setSelectedToolId(null);
            setActiveTab(tab);
          }}
          soundEnabled={preferences.soundEnabled}
          hapticsEnabled={preferences.hapticsEnabled}
        />
      </div>
    </div>
  );
}
