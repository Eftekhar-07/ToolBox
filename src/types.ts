/**
 * ToolBox Application Types
 */

export type TabType = 'home' | 'tools' | 'habits' | 'routines' | 'settings';

export type ToolCategory =
  | 'converters'
  | 'calculators'
  | 'time'
  | 'files'
  | 'text'
  | 'dev'
  | 'everyday';

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string; // Lucide icon name
  keywords: string[];
  isPopular?: boolean;
}

// Habit Types
export type HabitGoalType = 'binary' | 'numeric';
export type HabitFrequencyType = 'daily' | 'weekdays' | 'weekends' | 'custom_days';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  goalType: HabitGoalType;
  targetValue?: number; // e.g., 8 (glasses) or 30 (mins)
  unit?: string; // e.g. 'glasses', 'mins', 'pages'
  frequency: HabitFrequencyType;
  customDays?: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  reminderTime?: string; // "08:00"
  reminderEnabled?: boolean;
  createdAt: string;
  archived?: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // "YYYY-MM-DD"
  completed: boolean;
  currentValue?: number; // For numeric goals
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  completionRate: number; // Percentage
}

// Routine Types
export type RoutineMode = 'time' | 'duration';

export interface RoutineStep {
  id: string;
  title: string;
  durationMinutes?: number;
  durationSeconds?: number;
  startTime?: string; // "07:00"
  description?: string;
  linkedHabitId?: string;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  mode: RoutineMode;
  activeDays: number[]; // [0,1,2,3,4,5,6]
  startTime?: string; // "07:00"
  steps: RoutineStep[];
  createdAt: string;
}

// Settings & Preferences
export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserPreferences {
  theme: ThemeMode;
  decimalPrecision: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  weekStartMonday: boolean;
  favorites: string[]; // Tool IDs
  recentTools: string[]; // Tool IDs (max 10)
}

export interface AppExportData {
  version: string;
  exportDate: string;
  habits: Habit[];
  habitLogs: HabitLog[];
  routines: Routine[];
  preferences: UserPreferences;
}
