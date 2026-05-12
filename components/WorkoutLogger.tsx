'use client';

import { useState } from 'react';
import { Plus, Trash2, CheckCircle, Flame, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SKILL_NODES, TRACK_CONFIG } from '@/lib/skillData';
import type { WorkoutSet, Effort, Track } from '@/lib/types';

const EFFORT_LABELS: Record<Effort, string> = {
  1: 'Easy',
  2: 'Moderate',
  3: 'Hard',
  4: 'Very Hard',
  5: 'Max',
};

const EFFORT_COLORS: Record<Effort, string> = {
  1: '#00ff88',
  2: '#88ff00',
  3: '#ffcc00',
  4: '#ff8800',
  5: '#ff3333',
};

interface SetForm {
  exerciseId: string;
  exerciseName: string;
  track: Track;
  isIsometric: boolean;
  reps: string;
  holdTime: string;
  effort: Effort;
}

const EMPTY_FORM: SetForm = {
  exerciseId: '',
  exerciseName: '',
  track: 'push',
  isIsometric: false,
  reps: '',
  holdTime: '',
  effort: 3,
};

export default function WorkoutLogger() {
  const { state, saveSession } = useApp();
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [form, setForm] = useState<SetForm>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);

  const unlockedNodes = SKILL_NODES.filter(
    (n) => state.nodeStates[n.id] === 'unlocked' || state.nodeStates[n.id] === 'mastered'
  );

  const totalVolume = sets.reduce((acc, s) => acc + (s.reps ?? 0), 0);
  const totalHold = sets.reduce((acc, s) => acc + (s.holdTime ?? 0), 0);

  const addSet = () => {
    if (!form.exerciseId) return;
    const set: WorkoutSet = {
      id: Date.now().toString(),
      exerciseId: form.exerciseId,
      exerciseName: form.exerciseName,
      reps: form.isIsometric ? undefined : parseInt(form.reps) || undefined,
      holdTime: form.isIsometric ? parseInt(form.holdTime) || undefined : undefined,
      effort: form.effort,
    };
    setSets((prev) => [...prev, set]);
    setForm((f) => ({ ...f, reps: '', holdTime: '' }));
    setShowForm(false);
  };

  const removeSet = (id: string) => setSets((prev) => prev.filter((s) => s.id !== id));

  const handleSave = () => {
    if (sets.length === 0) return;
    saveSession(sets);
    setSets([]);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const selectExercise = (id: string) => {
    const node = SKILL_NODES.find((n) => n.id === id);
    if (node) {
      setForm((f) => ({
        ...f,
        exerciseId: id,
        exerciseName: node.name,
        track: node.track,
        isIsometric: node.isIsometric,
      }));
    }
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-6 pb-24">
        <CheckCircle size={56} className="text-[#00ff88] mb-4" />
        <h2 className="text-2xl font-black text-white mb-2">Session Saved!</h2>
        <p className="text-gray-400 text-center">
          {sets.length} sets logged. Keep showing up.
        </p>
        <div className="mt-4 flex items-center gap-2 text-[#00ff88]">
          <Flame size={18} />
          <span className="font-bold">{state.streak} day streak</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-32">
      {/* Header */}
      <div className="pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Log <span className="text-[#00ff88]">Session</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Flame size={14} className="text-orange-400" />
            <span className="text-sm text-gray-400">{state.streak} day streak</span>
          </div>
        </div>
        {sets.length > 0 && (
          <button
            onClick={handleSave}
            className="bg-[#00ff88] text-black font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#00dd77] transition-colors active:scale-95"
          >
            Save
          </button>
        )}
      </div>

      {/* Volume summary */}
      {sets.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-xl font-black text-white">{sets.length}</div>
            <div className="text-xs text-gray-500">Sets</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-xl font-black text-white">{totalVolume}</div>
            <div className="text-xs text-gray-500">Total Reps</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-xl font-black text-white">{totalHold}s</div>
            <div className="text-xs text-gray-500">Hold Time</div>
          </div>
        </div>
      )}

      {/* Sets list */}
      <div className="space-y-2 mb-4">
        {sets.map((set, i) => {
          const cfg = TRACK_CONFIG[SKILL_NODES.find((n) => n.id === set.exerciseId)?.track ?? 'push'];
          return (
            <div key={set.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/8">
              <div
                className="w-1 h-10 rounded-full"
                style={{ background: cfg.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm truncate">{set.exerciseName}</div>
                <div className="text-xs text-gray-500">
                  {set.reps ? `${set.reps} reps` : `${set.holdTime}s hold`} ·{' '}
                  <span style={{ color: EFFORT_COLORS[set.effort] }}>{EFFORT_LABELS[set.effort]}</span>
                </div>
              </div>
              <span className="text-xs text-gray-600">#{i + 1}</span>
              <button onClick={() => removeSet(set.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add set form */}
      {showForm ? (
        <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/10 mb-4">
          <h3 className="text-white font-bold mb-4">Add Set</h3>

          {/* Exercise picker */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1.5 block">EXERCISE</label>
            <div className="relative">
              <select
                value={form.exerciseId}
                onChange={(e) => selectExercise(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-[#00ff88] transition-colors"
              >
                <option value="">Select exercise...</option>
                {(['push', 'pull', 'core', 'legs'] as Track[]).map((track) => (
                  <optgroup key={track} label={TRACK_CONFIG[track].label}>
                    {unlockedNodes
                      .filter((n) => n.track === track)
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Reps or hold */}
          {form.exerciseId && (
            <div className="mb-4">
              {form.isIsometric ? (
                <>
                  <label className="text-xs text-gray-500 mb-1.5 block">HOLD TIME (seconds)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.holdTime}
                    onChange={(e) => setForm((f) => ({ ...f, holdTime: e.target.value }))}
                    placeholder="e.g. 10"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                  />
                </>
              ) : (
                <>
                  <label className="text-xs text-gray-500 mb-1.5 block">REPS</label>
                  <input
                    type="number"
                    min={1}
                    value={form.reps}
                    onChange={(e) => setForm((f) => ({ ...f, reps: e.target.value }))}
                    placeholder="e.g. 10"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                  />
                </>
              )}
            </div>
          )}

          {/* Effort */}
          <div className="mb-5">
            <label className="text-xs text-gray-500 mb-2 block">EFFORT</label>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as Effort[]).map((e) => (
                <button
                  key={e}
                  onClick={() => setForm((f) => ({ ...f, effort: e }))}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all duration-150 active:scale-95"
                  style={{
                    borderColor: form.effort === e ? EFFORT_COLORS[e] : 'rgba(255,255,255,0.1)',
                    color: form.effort === e ? EFFORT_COLORS[e] : '#6b7280',
                    background: form.effort === e ? `${EFFORT_COLORS[e]}18` : 'transparent',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="text-center text-xs mt-1" style={{ color: EFFORT_COLORS[form.effort] }}>
              {EFFORT_LABELS[form.effort]}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={addSet}
              disabled={!form.exerciseId || (!form.reps && !form.holdTime)}
              className="flex-1 py-3 rounded-xl bg-[#00ff88] text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#00dd77] transition-colors active:scale-95"
            >
              Add Set
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 rounded-xl border-2 border-dashed border-white/15 text-gray-400 flex items-center justify-center gap-2 hover:border-[#00ff88]/30 hover:text-[#00ff88] transition-all duration-200"
        >
          <Plus size={18} />
          Add Set
        </button>
      )}

      {sets.length === 0 && !showForm && (
        <p className="text-center text-gray-600 text-sm mt-8">
          No sets logged yet.<br />Add your first set above.
        </p>
      )}
    </div>
  );
}
