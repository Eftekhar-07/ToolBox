import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Routine, RoutineStep, Habit } from '../../types';
import { IconHelper } from '../common/IconHelper';
import { soundEffects } from '../../utils/audio';
import {
  Play,
  Plus,
  Pause,
  SkipForward,
  CheckCircle,
  X,
  ListTodo,
  Sparkles,
  Trash2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface RoutinesManagerProps {
  routines: Routine[];
  habits: Habit[];
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  activeExecutionRoutineId: string | null;
  onSaveRoutine: (routine: Routine) => void;
  onDeleteRoutine: (id: string) => void;
  onCloseExecution: () => void;
  onToggleHabitLog: (habitId: string) => void;
}

export const RoutinesManager: React.FC<RoutinesManagerProps> = ({
  routines,
  habits,
  soundEnabled,
  hapticsEnabled,
  activeExecutionRoutineId,
  onSaveRoutine,
  onDeleteRoutine,
  onCloseExecution,
  onToggleHabitLog,
}) => {
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Execution Focus Mode states
  const [executingRoutine, setExecutingRoutine] = useState<Routine | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [stepSecondsLeft, setStepSecondsLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('Sun');
  const [formColor, setFormColor] = useState('bg-amber-500');
  const [formSteps, setFormSteps] = useState<RoutineStep[]>([
    { id: 's1', title: 'Step 1', durationMinutes: 5 },
  ]);

  useEffect(() => {
    if (activeExecutionRoutineId) {
      const found = routines.find((r) => r.id === activeExecutionRoutineId);
      if (found) {
        startExecutionMode(found);
      }
    }
  }, [activeExecutionRoutineId, routines]);

  // Handle countdown during Execution Mode
  useEffect(() => {
    if (executingRoutine && !isPaused && stepSecondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setStepSecondsLeft((prev) => {
          if (prev <= 1) {
            handleCompleteStep();
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
  }, [executingRoutine, isPaused, stepSecondsLeft]);

  const startExecutionMode = (routine: Routine) => {
    soundEffects.playTap(soundEnabled);
    setExecutingRoutine(routine);
    setCurrentStepIdx(0);
    setIsPaused(false);
    const firstStep = routine.steps[0];
    const mins = firstStep?.durationMinutes || 1;
    setStepSecondsLeft(mins * 60);
  };

  const handleCompleteStep = () => {
    soundEffects.playCompletionChime(soundEnabled);
    soundEffects.vibrate(hapticsEnabled, [20, 50, 20]);

    if (!executingRoutine) return;

    const currentStep = executingRoutine.steps[currentStepIdx];
    // If step is linked to a habit, mark habit as done!
    if (currentStep?.linkedHabitId) {
      onToggleHabitLog(currentStep.linkedHabitId);
    }

    if (currentStepIdx < executingRoutine.steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      const nextStep = executingRoutine.steps[nextIdx];
      setStepSecondsLeft((nextStep.durationMinutes || 1) * 60);
    } else {
      // Completed entire routine!
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      setExecutingRoutine(null);
      onCloseExecution();
    }
  };

  const handleSkipStep = () => {
    soundEffects.playTap(soundEnabled);
    if (!executingRoutine) return;
    if (currentStepIdx < executingRoutine.steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      const nextStep = executingRoutine.steps[nextIdx];
      setStepSecondsLeft((nextStep.durationMinutes || 1) * 60);
    } else {
      setExecutingRoutine(null);
      onCloseExecution();
    }
  };

  const handleSaveRoutineForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    soundEffects.playTap(soundEnabled);

    const routineObj: Routine = {
      id: `routine-${Date.now()}`,
      name: formName.trim(),
      description: formDesc.trim() || undefined,
      icon: formIcon,
      color: formColor,
      mode: 'duration',
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      createdAt: new Date().toISOString(),
      steps: formSteps.length > 0 ? formSteps : [{ id: 's1', title: 'Start', durationMinutes: 5 }],
    };

    onSaveRoutine(routineObj);
    setShowAddModal(false);
  };

  const formatSecs = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const p = (n: number) => n.toString().padStart(2, '0');
    return `${p(m)}:${p(s)}`;
  };

  // EXECUTION MODE FULLSCREEN OVERLAY
  if (executingRoutine) {
    const currentStep = executingRoutine.steps[currentStepIdx];
    const totalSteps = executingRoutine.steps.length;
    const progressPct = Math.round(((currentStepIdx + 1) / totalSteps) * 100);

    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center max-w-md mx-auto w-full">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Focus Routine Mode
            </span>
            <h2 className="text-lg font-bold text-white">{executingRoutine.name}</h2>
          </div>
          <button
            onClick={() => {
              setExecutingRoutine(null);
              onCloseExecution();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Center Current Step Display */}
        <div className="max-w-md mx-auto w-full text-center my-auto space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-800/80 text-purple-300 text-xs font-bold">
            Step {currentStepIdx + 1} of {totalSteps}
          </div>

          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{currentStep?.title}</h1>
            {currentStep?.durationMinutes && (
              <p className="text-xs text-slate-400 mt-1">
                Target duration: {currentStep.durationMinutes} minutes
              </p>
            )}
          </div>

          <div className="text-6xl font-mono font-black text-purple-400 tracking-tight py-4">
            {formatSecs(stepSecondsLeft)}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className="bg-purple-500 h-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="max-w-md mx-auto w-full space-y-3 pb-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            <button
              onClick={handleSkipStep}
              className="py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <SkipForward size={18} /> Skip
            </button>

            <button
              onClick={handleCompleteStep}
              className="py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle size={18} /> Complete
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD ROUTINES LIST VIEW
  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between frosted-card rounded-[2rem] p-4 shadow-lg">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ListTodo size={20} className="text-purple-600 dark:text-purple-400" /> Routine Maker
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">Structured daily schedules</p>
        </div>

        <button
          onClick={() => {
            setFormName('');
            setFormDesc('');
            setFormSteps([
              { id: 's1', title: 'Start Task', durationMinutes: 10 },
              { id: 's2', title: 'Break / Hydrate', durationMinutes: 5 },
            ]);
            setShowAddModal(true);
          }}
          className="px-3.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-transform active:scale-95"
        >
          <Plus size={16} /> Create Routine
        </button>
      </div>

      {/* Routine Cards */}
      <div className="space-y-3">
        {routines.map((routine) => (
          <div
            key={routine.id}
            className="frosted-card rounded-[2rem] p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${routine.color} text-white shadow-xs`}>
                  <IconHelper name={routine.icon} size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{routine.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {routine.steps.length} steps • {routine.startTime || 'Flexible'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDeleteRoutine(routine.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => startExecutionMode(routine)}
                  className="px-3.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-transform active:scale-95"
                >
                  <Play size={14} className="fill-white" /> Start
                </button>
              </div>
            </div>

            {/* Steps Preview */}
            <div className="space-y-1.5 pt-2 border-t border-white/30 dark:border-white/10">
              {routine.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="frosted-subcard p-2 rounded-xl flex justify-between items-center text-xs"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {idx + 1}. {step.title}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">{step.durationMinutes} min</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ROUTINE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={handleSaveRoutineForm}
            className="frosted-card rounded-[2.25rem] max-w-sm w-full p-5 border border-white/50 dark:border-white/10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Create New Routine</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Routine Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Evening Workout, Study Block..."
                className="w-full mt-1 px-3 py-2.5 rounded-2xl frosted-subcard text-slate-900 dark:text-white text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Routine Steps Creator */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-500">Routine Steps</label>
                <button
                  type="button"
                  onClick={() =>
                    setFormSteps((prev) => [
                      ...prev,
                      { id: `s-${Date.now()}`, title: 'New Step', durationMinutes: 10 },
                    ])
                  }
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  <Plus size={12} /> Add Step
                </button>
              </div>

              <div className="space-y-2">
                {formSteps.map((s, idx) => (
                  <div key={s.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={s.title}
                      onChange={(e) => {
                        const newSteps = [...formSteps];
                        newSteps[idx].title = e.target.value;
                        setFormSteps(newSteps);
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                    />
                    <input
                      type="number"
                      value={s.durationMinutes}
                      onChange={(e) => {
                        const newSteps = [...formSteps];
                        newSteps[idx].durationMinutes = parseInt(e.target.value) || 1;
                        setFormSteps(newSteps);
                      }}
                      className="w-16 px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setFormSteps(formSteps.filter((i) => i.id !== s.id))}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
            >
              Save Routine
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
