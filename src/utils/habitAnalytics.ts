/**
 * Habit Analytics & Calculations Helper
 */

import { Habit, HabitLog } from '../types';

/**
 * Checks if a habit is scheduled on a given date string "YYYY-MM-DD" or Date object
 */
export function isHabitScheduledOnDate(habit: Habit, dateInput: Date | string): boolean {
  let d: Date;
  if (typeof dateInput === 'string') {
    d = new Date(dateInput + 'T00:00:00');
  } else {
    d = dateInput;
  }

  const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat

  if (!habit.frequency || habit.frequency === 'daily') {
    return true;
  }
  if (habit.frequency === 'weekdays') {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }
  if (habit.frequency === 'weekends') {
    return dayOfWeek === 0 || dayOfWeek === 6;
  }
  if (habit.frequency === 'custom_days') {
    if (!habit.customDays || habit.customDays.length === 0) return true;
    return habit.customDays.includes(dayOfWeek);
  }

  return true;
}

/**
 * Calculate Current and Best Streak for a single habit based on its schedule
 */
export function calculateHabitStreaks(habit: Habit, habitLogs: HabitLog[]): { currentStreak: number; bestStreak: number } {
  const completedDateSet = new Set(
    habitLogs
      .filter((l) => l.habitId === habit.id && l.completed)
      .map((l) => l.date)
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const todayDate = new Date(todayStr + 'T00:00:00');

  // 1. Calculate Current Streak
  let currentStreak = 0;
  let curr = new Date(todayDate);

  // Check today first if scheduled
  if (isHabitScheduledOnDate(habit, curr)) {
    const todayStrCurr = curr.toISOString().split('T')[0];
    if (completedDateSet.has(todayStrCurr)) {
      currentStreak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      // Today is scheduled but not completed yet; don't count today as broken yet, start checking from yesterday
      curr.setDate(curr.getDate() - 1);
    }
  } else {
    // Today is not scheduled, start checking from yesterday
    curr.setDate(curr.getDate() - 1);
  }

  // Iterate backwards
  let daysChecked = 0;
  while (daysChecked < 365) {
    const dateStr = curr.toISOString().split('T')[0];

    // If habit wasn't created yet before this date (give 1 day buffer), stop
    const createdStr = habit.createdAt ? habit.createdAt.split('T')[0] : '2000-01-01';
    if (dateStr < createdStr) {
      break;
    }

    if (isHabitScheduledOnDate(habit, curr)) {
      if (completedDateSet.has(dateStr)) {
        currentStreak++;
      } else {
        // Missed a scheduled day
        break;
      }
    }
    // If not scheduled on this day, skip without resetting or incrementing
    curr.setDate(curr.getDate() - 1);
    daysChecked++;
  }

  // 2. Calculate Best Streak across history
  // Gather all scheduled dates from createdAt (or earliest log) up to today
  let start = new Date(todayDate);
  start.setDate(start.getDate() - 365);
  if (habit.createdAt) {
    const createdDate = new Date(habit.createdAt.split('T')[0] + 'T00:00:00');
    if (createdDate < start) {
      start = createdDate;
    }
  }

  let bestStreak = 0;
  let tempStreak = 0;
  let runner = new Date(start);

  while (runner <= todayDate) {
    const runnerStr = runner.toISOString().split('T')[0];

    if (isHabitScheduledOnDate(habit, runner)) {
      if (completedDateSet.has(runnerStr)) {
        tempStreak++;
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
      } else {
        // If it's today and not completed yet, don't break tempStreak for bestStreak calculation
        if (runnerStr !== todayStr) {
          tempStreak = 0;
        }
      }
    }
    runner.setDate(runner.getDate() + 1);
  }

  return { currentStreak, bestStreak };
}

/**
 * Get dates for the current week starting Monday to Sunday
 */
export function getCurrentWeekDays(refDate = new Date()): { dateStr: string; dayName: string; dayShort: string; isToday: boolean }[] {
  const d = new Date(refDate);
  const day = d.getDay(); // 0 = Sun, 1 = Mon...
  const diffToMon = day === 0 ? -6 : 1 - day; // diff to Monday

  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMon);

  const todayStr = new Date().toISOString().split('T')[0];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayShorts = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const week = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const dateStr = cur.toISOString().split('T')[0];
    week.push({
      dateStr,
      dayName: dayNames[i],
      dayShort: dayShorts[i],
      isToday: dateStr === todayStr,
    });
  }
  return week;
}

/**
 * Get weekly completion data for active habits
 */
export function getWeeklyCompletionStats(habits: Habit[], habitLogs: HabitLog[]) {
  const activeHabits = habits.filter((h) => !h.archived);
  const weekDays = getCurrentWeekDays();

  let totalScheduledOccurrences = 0;
  let totalCompletedOccurrences = 0;

  const barData = weekDays.map((wd) => {
    let completedCount = 0;
    let scheduledCount = 0;

    activeHabits.forEach((habit) => {
      if (isHabitScheduledOnDate(habit, wd.dateStr)) {
        scheduledCount++;
        const log = habitLogs.find((l) => l.habitId === habit.id && l.date === wd.dateStr && l.completed);
        if (log) {
          completedCount++;
        }
      }
    });

    totalScheduledOccurrences += scheduledCount;
    totalCompletedOccurrences += completedCount;

    return {
      dayShort: wd.dayShort,
      dayName: wd.dayName,
      dateStr: wd.dateStr,
      isToday: wd.isToday,
      completedCount,
      scheduledCount,
    };
  });

  const weeklyPercentage = totalScheduledOccurrences > 0
    ? Math.round((totalCompletedOccurrences / totalScheduledOccurrences) * 100)
    : 0;

  const hasAnyData = totalCompletedOccurrences > 0;

  return {
    barData,
    weeklyPercentage,
    totalScheduledOccurrences,
    totalCompletedOccurrences,
    hasAnyData,
  };
}

/**
 * Get monthly completion matrix for Heatmap (for a specific year and month 0-11)
 */
export function getMonthlyHeatmapData(year: number, month: number, habits: Habit[], habitLogs: HabitLog[]) {
  const activeHabits = habits.filter((h) => !h.archived);
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const totalDays = lastDay.getDate();
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sun=0 -> Mon=0

  const daysData = [];

  for (let d = 1; d <= totalDays; d++) {
    const curDate = new Date(year, month, d);
    const dateStr = curDate.toISOString().split('T')[0];

    let scheduledCount = 0;
    let completedCount = 0;

    activeHabits.forEach((habit) => {
      if (isHabitScheduledOnDate(habit, dateStr)) {
        scheduledCount++;
        const log = habitLogs.find((l) => l.habitId === habit.id && l.date === dateStr && l.completed);
        if (log) {
          completedCount++;
        }
      }
    });

    const completionRate = scheduledCount > 0 ? (completedCount / scheduledCount) * 100 : 0;

    // Intensity level: 0 = empty, 1 = 1-25%, 2 = 26-50%, 3 = 51-75%, 4 = 76-99%, 5 = 100%
    let level = 0;
    if (completedCount > 0) {
      if (completionRate === 100) level = 5;
      else if (completionRate >= 76) level = 4;
      else if (completionRate >= 51) level = 3;
      else if (completionRate >= 26) level = 2;
      else level = 1;
    }

    daysData.push({
      dayNumber: d,
      dateStr,
      scheduledCount,
      completedCount,
      completionRate: Math.round(completionRate),
      level,
    });
  }

  return {
    year,
    month,
    startDayOfWeek,
    daysData,
    monthName: firstDay.toLocaleString('default', { month: 'long' }),
  };
}

/**
 * Get single habit calendar for a specific month
 */
export function getHabitMonthlyCalendar(
  habit: Habit,
  habitLogs: HabitLog[],
  year: number,
  month: number
) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const totalDays = lastDay.getDate();
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Mon = 0
  const todayStr = new Date().toISOString().split('T')[0];

  const daysData = [];

  for (let d = 1; d <= totalDays; d++) {
    const curDate = new Date(year, month, d);
    const dateStr = curDate.toISOString().split('T')[0];

    const isScheduled = isHabitScheduledOnDate(habit, curDate);
    const log = habitLogs.find((l) => l.habitId === habit.id && l.date === dateStr);
    const completed = !!log?.completed;
    const value = log?.currentValue ?? (completed ? (habit.targetValue || 1) : 0);

    const isFuture = dateStr > todayStr;
    const isToday = dateStr === todayStr;

    daysData.push({
      dayNumber: d,
      dateStr,
      isScheduled,
      completed,
      value,
      isFuture,
      isToday,
    });
  }

  return {
    year,
    month,
    startDayOfWeek,
    daysData,
    monthName: firstDay.toLocaleString('default', { month: 'long' }),
  };
}

/**
 * Calculate habit-specific metrics for time range selector (7d, 30d, 3m, 6m, 1y)
 */
export type TimeRangeType = '7d' | '30d' | '3m' | '6m' | '1y';

export function getHabitDetailedStats(
  habit: Habit,
  habitLogs: HabitLog[],
  range: TimeRangeType = '30d'
) {
  const logs = habitLogs.filter((l) => l.habitId === habit.id && l.completed);
  const totalCompletions = logs.length;

  const { currentStreak, bestStreak } = calculateHabitStreaks(habit, habitLogs);

  // Total Days Tracked (from habit creation to today)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const createdDate = habit.createdAt
    ? new Date(habit.createdAt.split('T')[0] + 'T00:00:00')
    : new Date(today.getTime() - 30 * 86400000);

  const totalDaysTracked = Math.max(
    1,
    Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  // Determine range days
  let rangeDays = 30;
  if (range === '7d') rangeDays = 7;
  else if (range === '30d') rangeDays = 30;
  else if (range === '3m') rangeDays = 90;
  else if (range === '6m') rangeDays = 180;
  else if (range === '1y') rangeDays = 365;

  const timeSeries = [];
  let scheduledInRange = 0;
  let completedInRange = 0;
  let totalNumericSumInRange = 0;

  for (let i = rangeDays - 1; i >= 0; i--) {
    const cur = new Date(today);
    cur.setDate(today.getDate() - i);
    const dateStr = cur.toISOString().split('T')[0];

    const isScheduled = isHabitScheduledOnDate(habit, cur);
    const log = habitLogs.find((l) => l.habitId === habit.id && l.date === dateStr);
    const completed = !!log?.completed;
    const val = log?.currentValue ?? (completed ? (habit.targetValue || 1) : 0);

    if (isScheduled) {
      scheduledInRange++;
      if (completed) completedInRange++;
      totalNumericSumInRange += val;
    }

    timeSeries.push({
      dateStr,
      label: rangeDays <= 30
        ? `${cur.getMonth() + 1}/${cur.getDate()}`
        : `${cur.toLocaleString('default', { month: 'short' })} ${cur.getDate()}`,
      dayShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][cur.getDay()],
      isScheduled,
      completed,
      value: val,
      target: habit.targetValue || 1,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
    });
  }

  // Calculate Overall Completion Rate (since created)
  let overallScheduled = 0;
  let overallCompleted = 0;

  let runner = new Date(createdDate);
  const dateLogMap = new Map(habitLogs.filter((l) => l.habitId === habit.id).map((l) => [l.date, l]));

  while (runner <= today) {
    const rStr = runner.toISOString().split('T')[0];
    if (isHabitScheduledOnDate(habit, runner)) {
      overallScheduled++;
      const l = dateLogMap.get(rStr);
      if (l?.completed) {
        overallCompleted++;
      }
    }
    runner.setDate(runner.getDate() + 1);
  }

  const overallCompletionRate = overallScheduled > 0 ? Math.round((overallCompleted / overallScheduled) * 100) : 0;
  const rangeCompletionRate = scheduledInRange > 0 ? Math.round((completedInRange / scheduledInRange) * 100) : 0;

  // Average Progress & Numeric Metrics
  const targetAmount = habit.targetValue || 1;
  const averageAmountCompleted = scheduledInRange > 0 ? parseFloat((totalNumericSumInRange / scheduledInRange).toFixed(1)) : 0;
  const goalAchievementRate = targetAmount > 0 ? Math.min(100, Math.round((averageAmountCompleted / targetAmount) * 100)) : rangeCompletionRate;
  const averageProgress = habit.goalType === 'numeric' ? goalAchievementRate : rangeCompletionRate;

  // Weekly rate (last 7 days)
  let last7Scheduled = 0;
  let last7Completed = 0;
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    if (isHabitScheduledOnDate(habit, d)) {
      last7Scheduled++;
      if (dateLogMap.get(dStr)?.completed) last7Completed++;
    }
  }
  const weeklyRate = last7Scheduled > 0 ? Math.round((last7Completed / last7Scheduled) * 100) : 0;

  // Monthly rate (last 30 days)
  let last30Scheduled = 0;
  let last30Completed = 0;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    if (isHabitScheduledOnDate(habit, d)) {
      last30Scheduled++;
      if (dateLogMap.get(dStr)?.completed) last30Completed++;
    }
  }
  const monthlyRate = last30Scheduled > 0 ? Math.round((last30Completed / last30Scheduled) * 100) : 0;

  return {
    currentStreak,
    bestStreak,
    totalCompletions,
    totalDaysTracked,
    overallCompletionRate,
    rangeCompletionRate,
    averageProgress,
    averageAmountCompleted,
    targetAmount,
    goalAchievementRate,
    weeklyRate,
    monthlyRate,
    timeSeries,
  };
}
