/**
 * LocalStorage Persistence and Export/Import Engine
 */

import { Habit, HabitLog, Routine, UserPreferences, AppExportData } from '../types';

const KEYS = {
  PREFERENCES: 'toolbox_preferences_v1',
  HABITS: 'toolbox_habits_v1',
  HABIT_LOGS: 'toolbox_habit_logs_v1',
  ROUTINES: 'toolbox_routines_v1',
  CALC_HISTORY: 'toolbox_calc_history_v1',
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  decimalPrecision: 2,
  soundEnabled: true,
  hapticsEnabled: true,
  weekStartMonday: false,
  favorites: ['length_converter', 'basic_calculator', 'stopwatch', 'qr_generator'],
  recentTools: ['basic_calculator', 'length_converter'],
};

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: 'Drink Water',
    description: 'Stay hydrated throughout the day',
    icon: 'Droplets',
    color: 'bg-blue-500 text-blue-500',
    goalType: 'numeric',
    targetValue: 8,
    unit: 'glasses',
    frequency: 'daily',
    reminderTime: '09:00',
    reminderEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-2',
    name: 'Daily Exercise',
    description: 'Workout or brisk walk',
    icon: 'Activity',
    color: 'bg-emerald-500 text-emerald-500',
    goalType: 'numeric',
    targetValue: 30,
    unit: 'mins',
    frequency: 'daily',
    reminderTime: '17:00',
    reminderEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-3',
    name: 'Read 20 Pages',
    description: 'Read a book or article',
    icon: 'BookOpen',
    color: 'bg-amber-500 text-amber-500',
    goalType: 'numeric',
    targetValue: 20,
    unit: 'pages',
    frequency: 'daily',
    reminderTime: '21:00',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-4',
    name: 'Meditate',
    description: 'Mindful breathing session',
    icon: 'Heart',
    color: 'bg-purple-500 text-purple-500',
    goalType: 'binary',
    frequency: 'daily',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'routine-morning',
    name: 'Morning Routine',
    description: 'Start your day focused and refreshed',
    icon: 'Sun',
    color: 'bg-amber-500',
    mode: 'duration',
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    startTime: '07:00',
    createdAt: new Date().toISOString(),
    steps: [
      { id: 's1', title: 'Wake up & stretch', durationMinutes: 5 },
      { id: 's2', title: 'Drink a glass of water', durationMinutes: 2, linkedHabitId: 'habit-1' },
      { id: 's3', title: 'Morning exercise / Yoga', durationMinutes: 20, linkedHabitId: 'habit-2' },
      { id: 's4', title: 'Healthy Breakfast', durationMinutes: 15 },
    ],
  },
  {
    id: 'routine-study',
    name: 'Focus Study Routine',
    description: 'Deep work & study pomodoro blocks',
    icon: 'Brain',
    color: 'bg-indigo-500',
    mode: 'duration',
    activeDays: [1, 2, 3, 4, 5],
    startTime: '10:00',
    createdAt: new Date().toISOString(),
    steps: [
      { id: 's10', title: 'Review study objectives', durationMinutes: 5 },
      { id: 's11', title: 'Focus Session 1', durationMinutes: 25 },
      { id: 's12', title: 'Short Break & hydrate', durationMinutes: 5 },
      { id: 's13', title: 'Focus Session 2', durationMinutes: 25 },
    ],
  },
  {
    id: 'routine-night',
    name: 'Night Unwind Routine',
    description: 'Relax and prepare for restful sleep',
    icon: 'Moon',
    color: 'bg-purple-500',
    mode: 'duration',
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    startTime: '21:30',
    createdAt: new Date().toISOString(),
    steps: [
      { id: 's20', title: 'Organize workspace for tomorrow', durationMinutes: 10 },
      { id: 's21', title: 'Read a book', durationMinutes: 20, linkedHabitId: 'habit-3' },
      { id: 's22', title: 'Mindful Meditation', durationMinutes: 10, linkedHabitId: 'habit-4' },
    ],
  },
];

export const Storage = {
  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(KEYS.PREFERENCES);
      return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  },

  savePreferences(prefs: UserPreferences): void {
    try {
      localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (e) {
      console.error('Failed to save preferences', e);
    }
  },

  getHabits(): Habit[] {
    try {
      const data = localStorage.getItem(KEYS.HABITS);
      return data ? JSON.parse(data) : DEFAULT_HABITS;
    } catch {
      return DEFAULT_HABITS;
    }
  },

  saveHabits(habits: Habit[]): void {
    try {
      localStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
    } catch (e) {
      console.error('Failed to save habits', e);
    }
  },

  getHabitLogs(): HabitLog[] {
    try {
      const data = localStorage.getItem(KEYS.HABIT_LOGS);
      if (data) return JSON.parse(data);

      // Seed initial sample logs for past few days for demo experience
      const initialLogs: HabitLog[] = [];
      const today = new Date();
      for (let i = 1; i <= 6; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        initialLogs.push(
          { id: `log-1-${i}`, habitId: 'habit-1', date: dateStr, completed: true, currentValue: 8 },
          { id: `log-2-${i}`, habitId: 'habit-2', date: dateStr, completed: i % 2 === 0, currentValue: i % 2 === 0 ? 30 : 15 },
          { id: `log-3-${i}`, habitId: 'habit-3', date: dateStr, completed: true, currentValue: 20 }
        );
      }
      localStorage.setItem(KEYS.HABIT_LOGS, JSON.stringify(initialLogs));
      return initialLogs;
    } catch {
      return [];
    }
  },

  saveHabitLogs(logs: HabitLog[]): void {
    try {
      localStorage.setItem(KEYS.HABIT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save habit logs', e);
    }
  },

  getRoutines(): Routine[] {
    try {
      const data = localStorage.getItem(KEYS.ROUTINES);
      return data ? JSON.parse(data) : DEFAULT_ROUTINES;
    } catch {
      return DEFAULT_ROUTINES;
    }
  },

  saveRoutines(routines: Routine[]): void {
    try {
      localStorage.setItem(KEYS.ROUTINES, JSON.stringify(routines));
    } catch (e) {
      console.error('Failed to save routines', e);
    }
  },

  exportAllData(): string {
    const data: AppExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      habits: this.getHabits(),
      habitLogs: this.getHabitLogs(),
      routines: this.getRoutines(),
      preferences: this.getPreferences(),
    };
    return JSON.stringify(data, null, 2);
  },

  importAllData(jsonString: string): boolean {
    try {
      const data: AppExportData = JSON.parse(jsonString);
      if (data.habits && Array.isArray(data.habits)) this.saveHabits(data.habits);
      if (data.habitLogs && Array.isArray(data.habitLogs)) this.saveHabitLogs(data.habitLogs);
      if (data.routines && Array.isArray(data.routines)) this.saveRoutines(data.routines);
      if (data.preferences) this.savePreferences(data.preferences);
      return true;
    } catch (e) {
      console.error('Invalid import format', e);
      return false;
    }
  },

  clearAllData(): void {
    localStorage.removeItem(KEYS.PREFERENCES);
    localStorage.removeItem(KEYS.HABITS);
    localStorage.removeItem(KEYS.HABIT_LOGS);
    localStorage.removeItem(KEYS.ROUTINES);
    localStorage.removeItem(KEYS.CALC_HISTORY);
  },
};
