import React, { useRef, useState } from 'react';
import { UserPreferences } from '../../types';
import { soundEffects } from '../../utils/audio';
import { Storage } from '../../utils/storage';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Vibrate,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface SettingsManagerProps {
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: UserPreferences) => void;
  onDataRestored: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  preferences,
  onUpdatePreferences,
  onDataRestored,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggleSound = () => {
    const updated = { ...preferences, soundEnabled: !preferences.soundEnabled };
    soundEffects.playTap(updated.soundEnabled);
    onUpdatePreferences(updated);
  };

  const handleToggleHaptics = () => {
    const updated = { ...preferences, hapticsEnabled: !preferences.hapticsEnabled };
    soundEffects.vibrate(updated.hapticsEnabled, 15);
    onUpdatePreferences(updated);
  };

  const handleExportData = () => {
    soundEffects.playTap(preferences.soundEnabled);
    const jsonStr = Storage.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `toolbox-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      if (evt.target?.result) {
        const success = Storage.importAllData(evt.target.result as string);
        if (success) {
          setImportSuccess(true);
          setImportError(false);
          onDataRestored();
          setTimeout(() => setImportSuccess(false), 3000);
        } else {
          setImportError(true);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetAllData = () => {
    soundEffects.playTap(preferences.soundEnabled);
    Storage.clearAllData();
    setShowResetConfirm(false);
    onDataRestored();
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="frosted-card rounded-[2rem] p-4 shadow-lg">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon size={20} className="text-indigo-600 dark:text-indigo-400" /> Settings
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">Preferences, backup & offline privacy</p>
      </div>

      {/* APPEARANCE & THEME */}
      <section className="frosted-card rounded-[2rem] p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Appearance</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: SettingsIcon },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = preferences.theme === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  soundEffects.playTap(preferences.soundEnabled);
                  onUpdatePreferences({ ...preferences, theme: mode.id as 'light' | 'dark' | 'system' });
                }}
                className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                    : 'frosted-subcard text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon size={18} /> {mode.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* PREFERENCES */}
      <section className="frosted-card rounded-[2rem] p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sound & Haptics</h3>

        <div className="space-y-2">
          <button
            onClick={handleToggleSound}
            className="w-full p-3 rounded-2xl frosted-subcard flex items-center justify-between transition-colors shadow-xs"
          >
            <div className="flex items-center gap-3">
              {preferences.soundEnabled ? <Volume2 size={18} className="text-indigo-600 dark:text-indigo-400" /> : <VolumeX size={18} className="text-slate-400" />}
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Sound Effects</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{preferences.soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleToggleHaptics}
            className="w-full p-3 rounded-2xl frosted-subcard flex items-center justify-between transition-colors shadow-xs"
          >
            <div className="flex items-center gap-3">
              <Vibrate size={18} className="text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Haptic Feedback</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{preferences.hapticsEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </section>

      {/* BACKUP & DATA MANAGEMENT */}
      <section className="frosted-card rounded-[2rem] p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Data & Backup</h3>

        {importSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 backdrop-blur-xs">
            <Check size={16} /> Data restored successfully!
          </div>
        )}

        {importError && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 backdrop-blur-xs">
            <AlertTriangle size={16} /> Failed to import data file. Invalid format.
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportData}
            className="py-3 px-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 backdrop-blur-xs shadow-xs"
          >
            <Download size={16} /> Export JSON
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-3 px-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 backdrop-blur-xs shadow-xs"
          >
            <Upload size={16} /> Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="hidden"
          />
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full mt-2 py-2.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-1.5 backdrop-blur-xs"
        >
          <RotateCcw size={14} /> Reset App Data
        </button>
      </section>

      {/* PRIVACY & ABOUT */}
      <section className="frosted-card rounded-[2rem] p-5 shadow-sm space-y-2 text-center">
        <ShieldCheck size={28} className="mx-auto text-emerald-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Your data stays on your device</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
          ToolBox is completely offline, private, and ad-free. No account creation or internet required.
        </p>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-2">ToolBox v1.0.0 Android Web App</div>
      </section>

      {/* RESET DATA CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="frosted-card rounded-[2.25rem] max-w-sm w-full p-5 border border-white/50 dark:border-white/10 shadow-2xl space-y-4 text-center">
            <AlertTriangle size={36} className="mx-auto text-red-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Reset All App Data?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              This will reset all habits, logs, routines, favorites, and settings back to default. This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl frosted-subcard text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAllData}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md shadow-red-500/20"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
