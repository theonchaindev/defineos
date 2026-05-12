'use client';

import { useState } from 'react';
import { ChevronRight, Zap, Target, Dumbbell, Wind } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { SkillLevel, Goal, BaselineAnswers } from '@/lib/types';

const LEVELS: { id: SkillLevel; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', desc: 'New to calisthenics or returning after a break' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Solid push-ups, pull-ups, and basic holds' },
  { id: 'advanced', label: 'Advanced', desc: 'Muscle-ups, L-sits, and working on levers' },
];

const GOALS: { id: Goal; label: string; icon: React.ReactNode }[] = [
  { id: 'strength', label: 'Raw Strength', icon: <Dumbbell size={20} /> },
  { id: 'skill', label: 'Skill Mastery', icon: <Zap size={20} /> },
  { id: 'aesthetics', label: 'Aesthetics', icon: <Target size={20} /> },
  { id: 'flexibility', label: 'Flexibility', icon: <Wind size={20} /> },
];

export default function Onboarding() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<SkillLevel>('beginner');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [baseline, setBaseline] = useState<BaselineAnswers>({
    pullUps: 0,
    pushUps: 0,
    dips: 0,
    hangTime: 0,
  });

  const toggleGoal = (g: Goal) => {
    setGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const finish = () => {
    completeOnboarding(level, goals.length ? goals : ['strength'], baseline);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-white">
            DEFINE<span className="text-[#00ff88]">OS</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Build your body. Own your skills.</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-[#00ff88]' : i < step ? 'w-4 bg-[#00ff88]/40' : 'w-4 bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Step 0: Level */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Your current level</h2>
            <p className="text-gray-400 text-sm mb-6">Be honest — this seeds your skill tree.</p>
            <div className="space-y-3">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    level === l.id
                      ? 'border-[#00ff88] bg-[#00ff88]/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold">{l.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Goals */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Your goals</h2>
            <p className="text-gray-400 text-sm mb-6">Pick all that apply.</p>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-200 ${
                    goals.includes(g.id)
                      ? 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {g.icon}
                  <span className="text-sm font-medium">{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Baseline */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Baseline check</h2>
            <p className="text-gray-400 text-sm mb-6">Best effort — this unlocks your starting nodes.</p>
            <div className="space-y-4">
              {[
                { key: 'pullUps', label: 'Max Pull-Ups', suffix: 'reps' },
                { key: 'pushUps', label: 'Max Push-Ups', suffix: 'reps' },
                { key: 'dips', label: 'Max Dips', suffix: 'reps' },
                { key: 'hangTime', label: 'Dead Hang', suffix: 'sec' },
              ].map(({ key, label, suffix }) => (
                <div key={key}>
                  <label className="text-sm text-gray-400 mb-1.5 block">{label}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      value={baseline[key as keyof BaselineAnswers]}
                      onChange={(e) =>
                        setBaseline((prev) => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))
                      }
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#00ff88] transition-colors"
                    />
                    <span className="text-gray-500 text-sm w-8">{suffix}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-4 rounded-xl border border-white/10 text-gray-400 font-semibold hover:border-white/20 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={() => (step < 2 ? setStep((s) => s + 1) : finish())}
            className="flex-1 py-4 rounded-xl bg-[#00ff88] text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-[#00dd77] transition-colors active:scale-95"
          >
            {step < 2 ? 'Continue' : 'Start Training'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
