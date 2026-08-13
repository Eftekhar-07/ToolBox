import React, { useState, useEffect, useRef } from 'react';
import { soundEffects } from '../../utils/audio';
import { Play, Pause, RotateCcw, Flag, Clock } from 'lucide-react';

interface TimeToolsProps {
  toolId: string;
  soundEnabled?: boolean;
}

export const TimeTools: React.FC<TimeToolsProps> = ({ toolId, soundEnabled = true }) => {
  // --- STOPWATCH STATE ---
  const [swTimeMs, setSwTimeMs] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [swLaps, setSwLaps] = useState<number[]>([]);
  const swRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (swRunning) {
      swRef.current = setInterval(() => {
        setSwTimeMs((prev) => prev + 10);
      }, 10);
    } else if (swRef.current) {
      clearInterval(swRef.current);
    }
    return () => {
      if (swRef.current) clearInterval(swRef.current);
    };
  }, [swRunning]);

  const formatSwTime = (totalMs: number) => {
    const ms = Math.floor((totalMs % 1000) / 10);
    const sec = Math.floor((totalMs / 1000) % 60);
    const min = Math.floor((totalMs / (1000 * 60)) % 60);
    const hr = Math.floor(totalMs / (1000 * 60 * 60));

    const p = (n: number) => n.toString().padStart(2, '0');
    return `${hr > 0 ? p(hr) + ':' : ''}${p(min)}:${p(sec)}.${p(ms)}`;
  };

  const handleSwLap = () => {
    soundEffects.playTap(soundEnabled);
    setSwLaps((prev) => [swTimeMs, ...prev]);
  };

  const handleSwReset = () => {
    soundEffects.playTap(soundEnabled);
    setSwRunning(false);
    setSwTimeMs(0);
    setSwLaps([]);
  };

  // --- COUNTDOWN TIMER STATE ---
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 mins default
  const [timerRemaining, setTimerRemaining] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRunning && timerRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerRunning(false);
            soundEffects.playCompletionChime(soundEnabled);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timerRemaining, soundEnabled]);

  const setTimerPreset = (secs: number) => {
    soundEffects.playTap(soundEnabled);
    setTimerRunning(false);
    setTimerSeconds(secs);
    setTimerRemaining(secs);
  };

  const formatTimer = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    const p = (n: number) => n.toString().padStart(2, '0');
    return `${h > 0 ? p(h) + ':' : ''}${p(m)}:${p(s)}`;
  };

  // --- DATE DIFFERENCE STATE ---
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const getDaysDiff = () => {
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days;
  };

  // --- WORLD CLOCK ---
  const [nowTime, setNowTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const cities = [
    { name: 'London (GMT)', tz: 'Europe/London' },
    { name: 'New York (EST)', tz: 'America/New_York' },
    { name: 'Tokyo (JST)', tz: 'Asia/Tokyo' },
    { name: 'Paris (CET)', tz: 'Europe/Paris' },
    { name: 'Sydney (AEST)', tz: 'Australia/Sydney' },
    { name: 'Dubai (GST)', tz: 'Asia/Dubai' },
  ];

  // RENDER BASED ON TOOL ID
  if (toolId === 'stopwatch') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 text-center">
        <div className="text-5xl font-mono font-black text-slate-900 dark:text-white tracking-tight py-4">
          {formatSwTime(swTimeMs)}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              soundEffects.playTap(soundEnabled);
              setSwRunning(!swRunning);
            }}
            className={`p-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 ${
              swRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {swRunning ? <Pause size={20} /> : <Play size={20} />}
            {swRunning ? 'Pause' : 'Start'}
          </button>

          {swRunning && (
            <button
              onClick={handleSwLap}
              className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-2 active:scale-95"
            >
              <Flag size={20} /> Lap
            </button>
          )}

          <button
            onClick={handleSwReset}
            className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 active:scale-95"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {swLaps.length > 0 && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Laps</h4>
            <div className="max-h-40 overflow-y-auto space-y-1 text-xs font-mono">
              {swLaps.map((lapMs, idx) => (
                <div key={idx} className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500">Lap {swLaps.length - idx}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatSwTime(lapMs)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (toolId === 'countdown_timer') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 text-center">
        {/* Timer Presets */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { label: '1m', sec: 60 },
            { label: '5m', sec: 300 },
            { label: '10m', sec: 600 },
            { label: '15m', sec: 900 },
            { label: '30m', sec: 1800 },
            { label: '1h', sec: 3600 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => setTimerPreset(preset.sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timerSeconds === preset.sec
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="text-5xl font-mono font-black text-purple-600 dark:text-purple-400 tracking-tight py-4">
          {formatTimer(timerRemaining)}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              soundEffects.playTap(soundEnabled);
              setTimerRunning(!timerRunning);
            }}
            className={`p-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 ${
              timerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {timerRunning ? <Pause size={20} /> : <Play size={20} />}
            {timerRunning ? 'Pause' : 'Start'}
          </button>

          <button
            onClick={() => {
              soundEffects.playTap(soundEnabled);
              setTimerRunning(false);
              setTimerRemaining(timerSeconds);
            }}
            className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 active:scale-95"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (toolId === 'date_difference') {
    const days = getDaysDiff();
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Date Difference</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>

        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl border border-indigo-100 dark:border-indigo-900 text-center">
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase">Difference</span>
          <div className="text-3xl font-black text-indigo-700 dark:text-indigo-300 mt-1">{days} Days</div>
          <div className="text-xs text-slate-500 mt-1">
            ({(days / 7).toFixed(1)} Weeks / {(days / 30.4).toFixed(1)} Months)
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'world_clock') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock size={18} /> World Clock
        </h3>
        <div className="space-y-2">
          {cities.map((c) => {
            const timeStr = nowTime.toLocaleTimeString('en-US', {
              timeZone: c.tz,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });
            return (
              <div
                key={c.name}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center"
              >
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                <span className="text-sm font-mono font-black text-indigo-600 dark:text-indigo-400">
                  {timeStr}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
