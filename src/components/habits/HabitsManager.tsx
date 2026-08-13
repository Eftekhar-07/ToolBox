import React, { useState } from 'react';
import { Habit, HabitLog, HabitFrequencyType } from '../../types';
import { IconHelper } from '../common/IconHelper';
import { soundEffects } from '../../utils/audio';
import {
  isHabitScheduledOnDate,
  calculateHabitStreaks,
  getWeeklyCompletionStats,
  getMonthlyHeatmapData,
  getHabitDetailedStats,
  getHabitMonthlyCalendar,
  TimeRangeType,
} from '../../utils/habitAnalytics';
import {
  Plus,
  Check,
  Flame,
  Calendar,
  BarChart2,
  Trash2,
  Edit3,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Award,
  TrendingUp,
  Info,
  ArrowLeft,
  Target,
  CheckCircle2,
  XCircle,
  MinusCircle,
  RotateCcw,
} from 'lucide-react';

interface HabitsManagerProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onSaveHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onToggleHabitLog: (habitId: string, targetDate?: string, customValue?: number) => void;
}

export const HabitsManager: React.FC<HabitsManagerProps> = ({
  habits,
  habitLogs,
  soundEnabled,
  hapticsEnabled,
  onSaveHabit,
  onDeleteHabit,
  onToggleHabitLog,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabitDetail, setSelectedHabitDetail] = useState<Habit | null>(null);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<TimeRangeType>('30d');

  // Heatmap month selection state
  const [heatmapDate, setHeatmapDate] = useState<Date>(new Date());
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<{
    dateStr: string;
    completedCount: number;
    scheduledCount: number;
    completionRate: number;
  } | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('CheckCircle2');
  const [formColor, setFormColor] = useState('bg-indigo-500 text-indigo-500');
  const [formGoalType, setFormGoalType] = useState<'binary' | 'numeric'>('binary');
  const [formTarget, setFormTarget] = useState('1');
  const [formUnit, setFormUnit] = useState('times');
  const [formFrequency, setFormFrequency] = useState<HabitFrequencyType>('daily');
  const [formCustomDays, setFormCustomDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [formReminderTime, setFormReminderTime] = useState('08:00');
  const [formReminderEnabled, setFormReminderEnabled] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const availableIcons = [
    'CheckCircle2',
    'Droplets',
    'Activity',
    'BookOpen',
    'Heart',
    'Brain',
    'Zap',
    'Target',
    'Smile',
    'Sun',
    'Moon',
    'Coffee',
  ];

  const availableColors = [
    'bg-indigo-500 text-indigo-500',
    'bg-emerald-500 text-emerald-500',
    'bg-amber-500 text-amber-500',
    'bg-purple-500 text-purple-500',
    'bg-blue-500 text-blue-500',
    'bg-rose-500 text-rose-500',
  ];

  const activeHabits = habits.filter((h) => !h.archived);

  // Calculate Overall Streaks
  let topCurrentStreak = 0;
  let topBestStreak = 0;
  activeHabits.forEach((h) => {
    const { currentStreak, bestStreak } = calculateHabitStreaks(h, habitLogs);
    if (currentStreak > topCurrentStreak) topCurrentStreak = currentStreak;
    if (bestStreak > topBestStreak) topBestStreak = bestStreak;
  });

  // Calculate Weekly Stats
  const weeklyStats = getWeeklyCompletionStats(habits, habitLogs);

  // Calculate Heatmap Data
  const heatmapData = getMonthlyHeatmapData(
    heatmapDate.getFullYear(),
    heatmapDate.getMonth(),
    habits,
    habitLogs
  );

  const openCreateModal = (habitToEdit?: Habit) => {
    soundEffects.playTap(soundEnabled);
    if (habitToEdit) {
      setEditingHabit(habitToEdit);
      setFormName(habitToEdit.name);
      setFormDesc(habitToEdit.description || '');
      setFormIcon(habitToEdit.icon);
      setFormColor(habitToEdit.color);
      setFormGoalType(habitToEdit.goalType);
      setFormTarget(habitToEdit.targetValue?.toString() || '1');
      setFormUnit(habitToEdit.unit || 'times');
      setFormFrequency(habitToEdit.frequency || 'daily');
      setFormCustomDays(habitToEdit.customDays || [1, 2, 3, 4, 5]);
      setFormReminderTime(habitToEdit.reminderTime || '08:00');
      setFormReminderEnabled(!!habitToEdit.reminderEnabled);
    } else {
      setEditingHabit(null);
      setFormName('');
      setFormDesc('');
      setFormIcon('CheckCircle2');
      setFormColor('bg-indigo-500 text-indigo-500');
      setFormGoalType('binary');
      setFormTarget('1');
      setFormUnit('times');
      setFormFrequency('daily');
      setFormCustomDays([1, 2, 3, 4, 5]);
      setFormReminderTime('08:00');
      setFormReminderEnabled(false);
    }
    setShowAddModal(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    soundEffects.playTap(soundEnabled);

    const habitObj: Habit = {
      id: editingHabit ? editingHabit.id : `habit-${Date.now()}`,
      name: formName.trim(),
      description: formDesc.trim() || undefined,
      icon: formIcon,
      color: formColor,
      goalType: formGoalType,
      targetValue: formGoalType === 'numeric' ? parseFloat(formTarget) || 1 : undefined,
      unit: formGoalType === 'numeric' ? formUnit || 'times' : undefined,
      frequency: formFrequency,
      customDays: formFrequency === 'custom_days' ? formCustomDays : undefined,
      reminderTime: formReminderEnabled ? formReminderTime : undefined,
      reminderEnabled: formReminderEnabled,
      createdAt: editingHabit ? editingHabit.createdAt : new Date().toISOString(),
    };

    onSaveHabit(habitObj);
    setShowAddModal(false);
  };

  const toggleCustomDay = (dayIndex: number) => {
    if (formCustomDays.includes(dayIndex)) {
      if (formCustomDays.length > 1) {
        setFormCustomDays(formCustomDays.filter((d) => d !== dayIndex));
      }
    } else {
      setFormCustomDays([...formCustomDays, dayIndex].sort());
    }
  };

  // Scheduled for today
  const todayScheduledHabits = activeHabits.filter((h) => isHabitScheduledOnDate(h, todayStr));
  const todayCompletedCount = todayScheduledHabits.filter((h) => {
    const log = habitLogs.find((l) => l.habitId === h.id && l.date === todayStr);
    return log?.completed;
  }).length;
  const todayTotalCount = todayScheduledHabits.length;
  const todayPct = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  // Render Schedule Description helper
  const getScheduleLabel = (habit: Habit) => {
    if (habit.frequency === 'daily' || !habit.frequency) return 'Daily';
    if (habit.frequency === 'weekdays') return 'Weekdays (Mon-Fri)';
    if (habit.frequency === 'weekends') return 'Weekends (Sat-Sun)';
    if (habit.frequency === 'custom_days' && habit.customDays) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return habit.customDays.map((d) => days[d]).join(', ');
    }
    return 'Scheduled';
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header Bar */}
      <div className="flex items-center justify-between frosted-card rounded-[2rem] p-4 shadow-lg">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" /> Daily Habits & Analytics
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">Track streaks, graphs & habit history</p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-transform active:scale-95"
        >
          <Plus size={16} /> New Habit
        </button>
      </div>

      {/* 1. TODAY'S PROGRESS CARD */}
      <section className="frosted-card rounded-[2rem] p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today's Completion
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {todayCompletedCount} of {todayTotalCount} completed
            </h3>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {todayPct}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3.5 bg-slate-200/60 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/20 dark:border-white/5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${todayPct}%` }}
          />
        </div>
      </section>

      {/* 2. WEEKLY HABIT COMPLETION GRAPH & WEEKLY PERCENTAGE */}
      <section className="frosted-card rounded-[2rem] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Overview</h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-black backdrop-blur-xs">
            Weekly Progress: {weeklyStats.weeklyPercentage}%
          </span>
        </div>

        {!weeklyStats.hasAnyData ? (
          /* Friendly Empty State for Weekly Graph */
          <div className="py-8 text-center frosted-subcard rounded-2xl p-6 space-y-2">
            <BarChart2 size={36} className="mx-auto text-indigo-400/80 mb-1" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Your progress will appear here.
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Complete a few habits to start seeing your progress.
            </p>
          </div>
        ) : (
          /* Weekly Bar Chart */
          <div className="pt-2">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-3 items-end h-36 border-b border-slate-200 dark:border-slate-800 pb-2">
              {weeklyStats.barData.map((bar) => {
                const maxVal = Math.max(...weeklyStats.barData.map((b) => b.completedCount), 1);
                const heightPct = bar.completedCount > 0 ? Math.max((bar.completedCount / maxVal) * 100, 15) : 0;

                return (
                  <div key={bar.dateStr} className="flex flex-col items-center justify-end h-full group">
                    {/* Number Badge */}
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      {bar.completedCount}
                    </span>

                    {/* Bar container */}
                    <div className="w-full max-w-[28px] bg-slate-100 dark:bg-slate-800/60 rounded-t-xl h-24 flex items-end justify-center overflow-hidden p-0.5">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          bar.isToday
                            ? 'bg-gradient-to-t from-indigo-600 to-emerald-400 shadow-md shadow-indigo-500/30'
                            : 'bg-indigo-500/80 dark:bg-indigo-400/80 hover:bg-indigo-600'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <span
                      className={`text-[11px] font-bold mt-1.5 ${
                        bar.isToday
                          ? 'text-indigo-600 dark:text-indigo-400 underline underline-offset-2'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {bar.dayShort}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 3. STREAK SUMMARY CARDS */}
      <section className="grid grid-cols-2 gap-3">
        <div className="frosted-card rounded-[2rem] p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 backdrop-blur-xs">
            <Flame size={24} className="fill-amber-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Current Streak
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {topCurrentStreak} {topCurrentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        <div className="frosted-card rounded-[2rem] p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-500 border border-purple-500/30 backdrop-blur-xs">
            <Award size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Best Streak
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {topBestStreak} {topBestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      </section>

      {/* 4. MONTHLY HABIT CALENDAR / HEATMAP */}
      <section className="frosted-card rounded-[2rem] p-5 shadow-sm space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Heatmap</h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const prev = new Date(heatmapDate);
                prev.setMonth(prev.getMonth() - 1);
                setHeatmapDate(prev);
                setSelectedHeatmapDay(null);
              }}
              className="p-1.5 rounded-xl frosted-subcard hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[100px] text-center">
              {heatmapData.monthName} {heatmapData.year}
            </span>
            <button
              onClick={() => {
                const next = new Date(heatmapDate);
                next.setMonth(next.getMonth() + 1);
                setHeatmapDate(next);
                setSelectedHeatmapDay(null);
              }}
              className="p-1.5 rounded-xl frosted-subcard hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div>
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <span key={idx} className="text-[10px] font-bold text-slate-400">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty Offset cells */}
            {Array.from({ length: heatmapData.startDayOfWeek }).map((_, idx) => (
              <div key={`offset-${idx}`} className="h-7 rounded-lg opacity-0" />
            ))}

            {/* Month Day Cells */}
            {heatmapData.daysData.map((d) => {
              // Level colors
              let bgClass = 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 border border-transparent';
              if (d.level === 1) bgClass = 'bg-emerald-200 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
              if (d.level === 2) bgClass = 'bg-emerald-300 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border border-emerald-400 dark:border-emerald-700';
              if (d.level === 3) bgClass = 'bg-emerald-400 dark:bg-emerald-700 text-slate-900 dark:text-white border border-emerald-500';
              if (d.level === 4) bgClass = 'bg-emerald-500 dark:bg-emerald-600 text-white font-bold shadow-xs';
              if (d.level === 5) bgClass = 'bg-emerald-600 dark:bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/30';

              const isSelected = selectedHeatmapDay?.dateStr === d.dateStr;

              return (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedHeatmapDay(d)}
                  title={`${d.dateStr}: ${d.completedCount}/${d.scheduledCount} completed (${d.completionRate}%)`}
                  className={`h-7 rounded-lg text-[10px] flex items-center justify-center transition-all cursor-pointer ${bgClass} ${
                    isSelected ? 'ring-2 ring-indigo-500 scale-105' : 'hover:scale-105'
                  }`}
                >
                  {d.dayNumber}
                </button>
              );
            })}
          </div>

          {/* Selected Heatmap Day Details Popover */}
          {selectedHeatmapDay && (
            <div className="mt-3 p-3 frosted-subcard rounded-2xl text-xs space-y-1 animate-fade-in flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {selectedHeatmapDay.dateStr}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  Completed: {selectedHeatmapDay.completedCount} of {selectedHeatmapDay.scheduledCount} scheduled ({selectedHeatmapDay.completionRate}%)
                </span>
              </div>
              <button
                onClick={() => setSelectedHeatmapDay(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Heatmap Intensity Legend */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-3">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" title="0%" />
              <span className="w-3.5 h-3.5 rounded bg-emerald-200 dark:bg-emerald-950" title="1-25%" />
              <span className="w-3.5 h-3.5 rounded bg-emerald-300 dark:bg-emerald-900" title="26-50%" />
              <span className="w-3.5 h-3.5 rounded bg-emerald-400 dark:bg-emerald-700" title="51-75%" />
              <span className="w-3.5 h-3.5 rounded bg-emerald-500 dark:bg-emerald-600" title="76-99%" />
              <span className="w-3.5 h-3.5 rounded bg-emerald-600 dark:bg-emerald-500" title="100%" />
            </div>
            <span>More</span>
          </div>
        </div>
      </section>

      {/* 5. MY HABITS LIST */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            My Habits ({activeHabits.length})
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Tap card for analytics</span>
        </div>

        <div className="space-y-2.5">
          {activeHabits.map((habit) => {
            const log = habitLogs.find((l) => l.habitId === habit.id && l.date === todayStr);
            const isCompleted = !!log?.completed;
            const { currentStreak } = calculateHabitStreaks(habit, habitLogs);
            const isScheduledToday = isHabitScheduledOnDate(habit, todayStr);

            return (
              <div
                key={habit.id}
                className="frosted-card rounded-[2rem] p-4 shadow-sm flex items-center justify-between hover:border-indigo-400/50 transition-all cursor-pointer"
              >
                <div
                  onClick={() => setSelectedHabitDetail(habit)}
                  className="flex items-center gap-3.5 flex-1"
                >
                  <div className={`p-3 rounded-2xl ${habit.color.split(' ')[0]} text-white shadow-xs`}>
                    <IconHelper name={habit.icon} size={22} />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {habit.name}
                      {currentStreak > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center gap-0.5 backdrop-blur-xs">
                          <Flame size={12} className="fill-amber-500 text-amber-500" /> {currentStreak}d
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {getScheduleLabel(habit)} • {habit.goalType === 'numeric' ? `${habit.targetValue} ${habit.unit}` : 'Check-in'}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHabitDetail(habit);
                      }}
                      className="mt-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                    >
                      <BarChart2 size={12} /> View Progress
                    </button>
                  </div>
                </div>

                {/* 1-Tap Completion Check Button */}
                <button
                  onClick={() => {
                    soundEffects.playTap(soundEnabled);
                    soundEffects.vibrate(hapticsEnabled, 15);
                    onToggleHabitLog(habit.id);
                  }}
                  title={isScheduledToday ? 'Toggle completion' : 'Not scheduled for today (tap to toggle anyway)'}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-400 text-white scale-105 shadow-emerald-500/30'
                      : 'bg-white/40 dark:bg-slate-800/40 border-white/60 dark:border-white/10 text-slate-400 hover:border-indigo-400'
                  }`}
                >
                  {isCompleted ? <Check size={22} className="stroke-[3]" /> : <Plus size={18} />}
                </button>
              </div>
            );
          })}

          {activeHabits.length === 0 && (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 frosted-card rounded-[2rem] p-6 shadow-sm">
              <Sparkles size={32} className="mx-auto text-indigo-400 mb-2" />
              <p className="text-sm font-semibold">No active habits yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tap + New Habit above to start building routines!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 6. INDIVIDUAL HABIT ANALYTICS MODAL */}
      {selectedHabitDetail && (
        <HabitDetailAnalyticsModal
          habit={selectedHabitDetail}
          habitLogs={habitLogs}
          soundEnabled={soundEnabled}
          timeRange={analyticsTimeRange}
          onChangeTimeRange={setAnalyticsTimeRange}
          onToggleHabitLog={onToggleHabitLog}
          onClose={() => setSelectedHabitDetail(null)}
          onEdit={() => {
            const h = selectedHabitDetail;
            setSelectedHabitDetail(null);
            openCreateModal(h);
          }}
          onDelete={() => {
            soundEffects.playTap(soundEnabled);
            onDeleteHabit(selectedHabitDetail.id);
            setSelectedHabitDetail(null);
          }}
        />
      )}

      {/* 7. ADD / EDIT HABIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={handleSaveForm}
            className="frosted-card rounded-[2.25rem] max-w-sm w-full p-5 border border-white/50 dark:border-white/10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingHabit ? 'Edit Habit' : 'Add New Habit'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Habit Name
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Study CSE, Drink Water..."
                className="w-full px-3 py-2.5 rounded-2xl frosted-subcard text-slate-900 dark:text-white text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="e.g. 2 hours daily focus"
                className="w-full px-3 py-2 rounded-2xl frosted-subcard text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden"
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Choose Icon
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {availableIcons.map((ic) => (
                  <button
                    type="button"
                    key={ic}
                    onClick={() => setFormIcon(ic)}
                    className={`p-2 rounded-xl border transition-all ${
                      formIcon === ic
                        ? 'bg-indigo-600 text-white border-indigo-600 scale-105'
                        : 'frosted-subcard text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <IconHelper name={ic} size={18} />
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule & Frequency */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Schedule
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFormFrequency('daily')}
                  className={`py-2 px-2 rounded-xl font-bold border transition-all ${
                    formFrequency === 'daily'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'frosted-subcard text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Daily (Every day)
                </button>
                <button
                  type="button"
                  onClick={() => setFormFrequency('weekdays')}
                  className={`py-2 px-2 rounded-xl font-bold border transition-all ${
                    formFrequency === 'weekdays'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'frosted-subcard text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Weekdays (M-F)
                </button>
                <button
                  type="button"
                  onClick={() => setFormFrequency('weekends')}
                  className={`py-2 px-2 rounded-xl font-bold border transition-all ${
                    formFrequency === 'weekends'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'frosted-subcard text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Weekends (Sat-Sun)
                </button>
                <button
                  type="button"
                  onClick={() => setFormFrequency('custom_days')}
                  className={`py-2 px-2 rounded-xl font-bold border transition-all ${
                    formFrequency === 'custom_days'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'frosted-subcard text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Custom Days
                </button>
              </div>

              {/* Custom Day Toggles */}
              {formFrequency === 'custom_days' && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Select Days:</span>
                  <div className="flex gap-1 justify-between">
                    {[
                      { index: 1, label: 'M' },
                      { index: 2, label: 'T' },
                      { index: 3, label: 'W' },
                      { index: 4, label: 'T' },
                      { index: 5, label: 'F' },
                      { index: 6, label: 'S' },
                      { index: 0, label: 'S' },
                    ].map((d) => {
                      const active = formCustomDays.includes(d.index);
                      return (
                        <button
                          type="button"
                          key={d.index}
                          onClick={() => toggleCustomDay(d.index)}
                          className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                            active
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'frosted-subcard text-slate-400'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Goal Type */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Goal Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormGoalType('binary')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    formGoalType === 'binary'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'frosted-subcard text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Simple Check (Yes/No)
                </button>
                <button
                  type="button"
                  onClick={() => setFormGoalType('numeric')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    formGoalType === 'numeric'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'frosted-subcard text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Numeric Target
                </button>
              </div>
            </div>

            {formGoalType === 'numeric' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Target Value
                  </label>
                  <input
                    type="number"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl frosted-subcard text-slate-900 dark:text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Unit Name
                  </label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="glasses, mins, pages..."
                    className="w-full px-3 py-2 rounded-2xl frosted-subcard text-slate-900 dark:text-white text-xs font-bold"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
              >
                {editingHabit ? 'Save Changes' : 'Create Habit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

/* Sub-component: Habit Detail Analytics Screen / Modal */
interface HabitDetailAnalyticsModalProps {
  habit: Habit;
  habitLogs: HabitLog[];
  soundEnabled: boolean;
  timeRange: TimeRangeType;
  onChangeTimeRange: (range: TimeRangeType) => void;
  onToggleHabitLog: (habitId: string, targetDate?: string, customValue?: number) => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const HabitDetailAnalyticsModal: React.FC<HabitDetailAnalyticsModalProps> = ({
  habit,
  habitLogs,
  soundEnabled,
  timeRange,
  onChangeTimeRange,
  onToggleHabitLog,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    dateStr: string;
    completed: boolean;
    value: number;
    target: number;
    isScheduled: boolean;
  } | null>(null);

  // Calendar State for this Habit
  const today = new Date();
  const [calYear, setCalYear] = useState<number>(today.getFullYear());
  const [calMonth, setCalMonth] = useState<number>(today.getMonth());

  // Editing historical item modal/input
  const [editingHistoryDate, setEditingHistoryDate] = useState<string | null>(null);
  const [editingNumericVal, setEditingNumericVal] = useState<string>('');

  const stats = getHabitDetailedStats(habit, habitLogs, timeRange);
  const monthCal = getHabitMonthlyCalendar(habit, habitLogs, calYear, calMonth);

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const isNumeric = habit.goalType === 'numeric';

  const handleCorrectRecord = (dateStr: string, currentCompleted: boolean, currentValue: number) => {
    if (isNumeric) {
      setEditingHistoryDate(dateStr);
      setEditingNumericVal(currentCompleted ? String(currentValue) : String(habit.targetValue || 1));
    } else {
      soundEffects.playTap(soundEnabled);
      onToggleHabitLog(habit.id, dateStr);
    }
  };

  const handleSaveNumericCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHistoryDate) return;
    const val = parseFloat(editingNumericVal);
    soundEffects.playTap(soundEnabled);
    onToggleHabitLog(habit.id, editingHistoryDate, isNaN(val) ? 0 : val);
    setEditingHistoryDate(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="frosted-card rounded-[2.25rem] max-w-lg w-full p-4 sm:p-6 border border-white/50 dark:border-white/10 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Top Navigation Header */}
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 rounded-xl frosted-subcard flex items-center gap-1 font-bold text-xs"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <div className={`p-2.5 rounded-2xl ${habit.color.split(' ')[0]} text-white shadow-xs`}>
              <IconHelper name={habit.icon} size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{habit.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isNumeric ? `Target: ${habit.targetValue} ${habit.unit}` : 'Check-in Habit'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onEdit}
              title="Edit Habit"
              className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl frosted-subcard"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={onDelete}
              title="Delete Habit"
              className="p-2 text-rose-500 hover:text-rose-700 rounded-xl frosted-subcard"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Streak & Core Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-black flex items-center gap-1.5 backdrop-blur-xs">
            <Flame size={16} className="fill-amber-500 text-amber-500" />
            <span>🔥 {stats.currentStreak} Day Streak</span>
          </div>
          <div className="px-3 py-1.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-black flex items-center gap-1.5 backdrop-blur-xs">
            <Award size={16} className="text-purple-500" />
            <span>Best: {stats.bestStreak} Days</span>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp size={14} className="text-indigo-500" />
              Habit Performance
            </span>
            <div className="flex gap-1 overflow-x-auto p-0.5 frosted-subcard rounded-xl">
              {[
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: '3m', label: '3 Months' },
                { id: '6m', label: '6 Months' },
                { id: '1y', label: '1 Year' },
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => onChangeTimeRange(range.id as TimeRangeType)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    timeRange === range.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-indigo-500'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Graph Card */}
          <div className="frosted-subcard p-3.5 rounded-3xl space-y-2 relative border border-white/40 dark:border-white/5">
            {hoveredPoint ? (
              <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm flex items-center justify-between animate-fade-in">
                <span>{hoveredPoint.dateStr}</span>
                <span>
                  {isNumeric
                    ? `${hoveredPoint.value} / ${hoveredPoint.target} ${habit.unit} (${Math.round((hoveredPoint.value / hoveredPoint.target) * 100)}%)`
                    : hoveredPoint.isScheduled
                    ? hoveredPoint.completed
                      ? '✓ Completed'
                      : '✗ Missed'
                    : '— Not Scheduled'}
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium text-right pr-1">
                {isNumeric
                  ? `Goal: ${habit.targetValue} ${habit.unit} / scheduled day`
                  : 'Hover/Tap points to view exact logs'}
              </div>
            )}

            <HabitLineChart
              timeSeries={stats.timeSeries}
              isNumeric={isNumeric}
              unit={habit.unit}
              onHoverPoint={(pt) => setHoveredPoint(pt)}
            />
          </div>
        </div>

        {/* Detailed Statistics Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Statistics & Metrics
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="p-3 frosted-subcard rounded-2xl text-center">
              <div className="text-lg font-black text-amber-500">{stats.currentStreak} days</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">Current Streak</div>
            </div>

            <div className="p-3 frosted-subcard rounded-2xl text-center">
              <div className="text-lg font-black text-purple-600 dark:text-purple-400">{stats.bestStreak} days</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">Best Streak</div>
            </div>

            <div className="p-3 frosted-subcard rounded-2xl text-center">
              <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">{stats.totalCompletions}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">Total Completed</div>
            </div>

            <div className="p-3 frosted-subcard rounded-2xl text-center">
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{stats.rangeCompletionRate}%</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">Completion Rate</div>
            </div>

            <div className="p-3 frosted-subcard rounded-2xl text-center">
              <div className="text-lg font-black text-blue-600 dark:text-blue-400">{stats.averageProgress}%</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">Average Progress</div>
            </div>

            <div className="p-3 frosted-subcard rounded-2xl text-center">
              <div className="text-lg font-black text-slate-700 dark:text-slate-300">{stats.totalDaysTracked}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">Days Tracked</div>
            </div>

            {isNumeric && (
              <>
                <div className="p-3 frosted-subcard rounded-2xl text-center col-span-1">
                  <div className="text-lg font-black text-teal-600 dark:text-teal-400">
                    {stats.averageAmountCompleted} {habit.unit}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">
                    Avg Amount Completed
                  </div>
                </div>

                <div className="p-3 frosted-subcard rounded-2xl text-center col-span-1">
                  <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {stats.targetAmount} {habit.unit}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">
                    Target Amount
                  </div>
                </div>

                <div className="p-3 frosted-subcard rounded-2xl text-center col-span-2 sm:col-span-1">
                  <div className="text-lg font-black text-emerald-500">
                    {stats.goalAchievementRate}%
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">
                    Goal Achievement
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Monthly Calendar View for this Habit */}
        <div className="space-y-3 pt-2 border-t border-slate-200/50 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} className="text-indigo-500" />
              Monthly Calendar
            </h4>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg frosted-subcard text-slate-600 dark:text-slate-300 hover:text-indigo-500"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[100px] text-center">
                {monthCal.monthName} {monthCal.year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-lg frosted-subcard text-slate-600 dark:text-slate-300 hover:text-indigo-500"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="frosted-subcard p-3 rounded-2xl space-y-2">
            {/* Days of Week Headers */}
            <div className="grid grid-cols-7 text-center text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: monthCal.startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9" />
              ))}

              {monthCal.daysData.map((d) => {
                let badgeStyle = 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-transparent';
                let symbol = '—';

                if (d.isScheduled) {
                  if (d.completed) {
                    badgeStyle = 'bg-emerald-500 text-white font-bold shadow-xs shadow-emerald-500/30';
                    symbol = '✓';
                  } else if (!d.isFuture) {
                    badgeStyle = 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold';
                    symbol = '×';
                  }
                }

                return (
                  <button
                    key={d.dateStr}
                    onClick={() => handleCorrectRecord(d.dateStr, d.completed, d.value)}
                    title={`${d.dateStr}: ${d.isScheduled ? (d.completed ? 'Completed' : 'Missed') : 'Not Scheduled'} (tap to edit)`}
                    className={`h-9 rounded-xl flex flex-col items-center justify-center border transition-all text-[11px] relative cursor-pointer ${badgeStyle} ${
                      d.isToday ? 'ring-2 ring-indigo-500 font-black' : ''
                    }`}
                  >
                    <span className="text-[9px] opacity-75">{d.dayNumber}</span>
                    <span className="leading-none text-xs">{symbol}</span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 dark:text-slate-400 font-bold pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Completed (✓)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/30 border border-rose-500 inline-block" /> Missed (×)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" /> Not Scheduled (—)
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Habit History List with Edit Controls */}
        <div className="space-y-3 pt-2 border-t border-slate-200/50 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <RotateCcw size={14} className="text-indigo-500" />
              Habit History & Corrections
            </h4>
            <span className="text-[10px] text-slate-400">Tap record to correct</span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {stats.timeSeries
              .slice()
              .reverse()
              .map((item) => {
                const dateObj = new Date(item.dateStr + 'T00:00:00');
                const monthName = dateObj.toLocaleString('default', { month: 'short' });
                const dayNum = dateObj.getDate();

                return (
                  <div
                    key={item.dateStr}
                    onClick={() => handleCorrectRecord(item.dateStr, item.completed, item.value)}
                    className="p-2.5 rounded-2xl frosted-subcard hover:border-indigo-400/50 flex items-center justify-between transition-all cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-900 dark:text-slate-100 min-w-[70px]">
                        {monthName} {dayNum} <span className="text-[10px] text-slate-400 font-medium">({item.dayShort})</span>
                      </span>

                      {item.isScheduled ? (
                        item.completed ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Completed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1">
                            <XCircle size={12} /> Missed
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-medium flex items-center gap-1">
                          <MinusCircle size={12} /> Not Scheduled
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isNumeric && item.isScheduled && (
                        <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {item.value} / {item.target} {habit.unit}
                        </span>
                      )}
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                        Correct
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Modal Prompt for Numeric History Correction */}
        {editingHistoryDate && (
          <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
            <form
              onSubmit={handleSaveNumericCorrection}
              className="frosted-card rounded-3xl p-5 max-w-xs w-full space-y-3 border border-indigo-500/30 shadow-2xl"
            >
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Correct Entry for {editingHistoryDate}
              </h4>
              <p className="text-xs text-slate-500">
                Enter actual amount achieved (Target: {habit.targetValue} {habit.unit}):
              </p>
              <input
                type="number"
                step="any"
                min="0"
                value={editingNumericVal}
                onChange={(e) => setEditingNumericVal(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 rounded-2xl frosted-subcard text-slate-900 dark:text-white font-mono text-sm font-bold"
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingHistoryDate(null)}
                  className="flex-1 py-2 rounded-xl frosted-subcard text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

/* SVG Line Chart for Habit Progress (Supports Yes/No & Numeric Habits) */
interface HabitLineChartProps {
  timeSeries: {
    dateStr: string;
    label: string;
    dayShort: string;
    isScheduled: boolean;
    completed: boolean;
    value: number;
    target: number;
  }[];
  isNumeric: boolean;
  unit: string;
  onHoverPoint: (
    pt: {
      label: string;
      dateStr: string;
      completed: boolean;
      value: number;
      target: number;
      isScheduled: boolean;
    } | null
  ) => void;
}

const HabitLineChart: React.FC<HabitLineChartProps> = ({
  timeSeries,
  isNumeric,
  unit,
  onHoverPoint,
}) => {
  if (!timeSeries || timeSeries.length === 0) {
    return <div className="h-32 flex items-center justify-center text-xs text-slate-400">No history available</div>;
  }

  const width = 360;
  const height = 150;
  const paddingX = 24;
  const paddingTop = 24;
  const paddingBottom = 32;

  const N = timeSeries.length;
  const stepX = (width - paddingX * 2) / Math.max(N - 1, 1);

  // Maximum value for scaling graph
  const maxTarget = Math.max(...timeSeries.map((t) => t.target || 1), 1);
  const maxVal = Math.max(...timeSeries.map((t) => t.value || 0), maxTarget);
  const graphMax = isNumeric ? maxVal * 1.1 : 1;

  // Points calculation
  const points = timeSeries.map((item, idx) => {
    const x = paddingX + idx * stepX;
    let ratio = 0;
    if (isNumeric) {
      ratio = graphMax > 0 ? item.value / graphMax : 0;
    } else {
      ratio = item.completed ? 1 : 0;
    }
    const y = height - paddingBottom - ratio * (height - paddingTop - paddingBottom);
    return { ...item, x, y };
  });

  // Construct SVG path
  let pathD = '';
  points.forEach((pt, idx) => {
    if (idx === 0) pathD += `M ${pt.x} ${pt.y}`;
    else pathD += ` L ${pt.x} ${pt.y}`;
  });

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  // Target baseline Y coordinate for numeric habit
  const targetY = isNumeric
    ? height - paddingBottom - (maxTarget / graphMax) * (height - paddingTop - paddingBottom)
    : height - paddingTop;

  // Filter X-axis labels to prevent overcrowding
  const labelIndices = N <= 7 ? points.map((_, i) => i) : [0, Math.floor(N / 2), N - 1];

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="habitAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Target Line for Numeric Habit */}
        {isNumeric && (
          <g>
            <line
              x1={paddingX}
              y1={targetY}
              x2={width - paddingX}
              y2={targetY}
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.7"
            />
            <text
              x={width - paddingX}
              y={targetY - 4}
              textAnchor="end"
              className="text-[8px] fill-emerald-500 font-bold"
            >
              Goal: {maxTarget} {unit}
            </text>
          </g>
        )}

        {/* Baseline (0 value) */}
        <line
          x1={paddingX}
          y1={height - paddingBottom}
          x2={width - paddingX}
          y2={height - paddingBottom}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-700"
          strokeDasharray="3 3"
        />

        {/* Filled Area */}
        <path d={areaD} fill="url(#habitAreaGradient)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data Points */}
        {points.map((pt, idx) => {
          let fillClass = 'fill-slate-400';
          if (pt.isScheduled) {
            if (pt.completed) {
              fillClass = 'fill-emerald-500 stroke-white dark:stroke-slate-900 stroke-2';
            } else {
              fillClass = 'fill-rose-400 stroke-white dark:stroke-slate-900 stroke-2';
            }
          }

          return (
            <circle
              key={pt.dateStr + idx}
              cx={pt.x}
              cy={pt.y}
              r={pt.completed ? 4.5 : 3}
              className={`cursor-pointer transition-all ${fillClass}`}
              onMouseEnter={() => onHoverPoint(pt)}
              onMouseLeave={() => onHoverPoint(null)}
              onTouchStart={() => onHoverPoint(pt)}
            />
          );
        })}

        {/* X-Axis Labels */}
        {labelIndices.map((idx) => {
          const pt = points[idx];
          if (!pt) return null;
          return (
            <text
              key={`lbl-${idx}`}
              x={pt.x}
              y={height - 10}
              textAnchor="middle"
              className="text-[9px] fill-slate-400 font-semibold"
            >
              {pt.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
