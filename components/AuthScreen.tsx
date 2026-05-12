'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { ChevronRight, Camera, Eye, EyeOff, Dumbbell, Zap, Target, Wind, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { SkillLevel, Goal, BaselineAnswers } from '@/lib/types';

type Mode = 'landing' | 'register' | 'login';
type RegStep = 0 | 1 | 2 | 3;

const LEVELS: { id: SkillLevel; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', desc: 'New or returning after a break' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Solid push-ups, pull-ups, basic holds' },
  { id: 'advanced', label: 'Advanced', desc: 'Muscle-ups, L-sits, working on levers' },
];

const GOALS: { id: Goal; label: string; icon: React.ReactNode }[] = [
  { id: 'strength', label: 'Raw Strength', icon: <Dumbbell size={20} /> },
  { id: 'skill', label: 'Skill Mastery', icon: <Zap size={20} /> },
  { id: 'aesthetics', label: 'Aesthetics', icon: <Target size={20} /> },
  { id: 'flexibility', label: 'Flexibility', icon: <Wind size={20} /> },
];

function AvatarPicker({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) onChange(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden hover:border-[#00ff88]/60 transition-colors relative"
      >
        {value ? (
          <img src={value} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-500">
            <Camera size={24} />
            <span className="text-xs">Add photo</span>
          </div>
        )}
        {value && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Camera size={20} className="text-white" />
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

export default function AuthScreen() {
  const { register, login } = useApp();
  const [mode, setMode] = useState<Mode>('landing');

  // Register state
  const [step, setStep] = useState<RegStep>(0);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [level, setLevel] = useState<SkillLevel>('beginner');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [baseline, setBaseline] = useState<BaselineAnswers>({ pullUps: 0, pushUps: 0, dips: 0, hangTime: 0 });
  const [regError, setRegError] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  const toggleGoal = (g: Goal) =>
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const nextStep = () => {
    if (step === 0) {
      if (!username.trim()) return setRegError('Enter a username');
      if (!email.trim() || !email.includes('@')) return setRegError('Enter a valid email');
      if (password.length < 6) return setRegError('Password must be 6+ characters');
      setRegError('');
    }
    setStep((s) => (s + 1) as RegStep);
  };

  const finishRegister = () => {
    register(
      {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        profilePic,
        joinedAt: new Date().toISOString(),
      },
      level,
      goals.length ? goals : ['strength'],
      baseline
    );
  };

  const handleLogin = () => {
    setLoginError('');
    const ok = login(loginEmail.trim().toLowerCase(), loginPassword);
    if (!ok) setLoginError('Incorrect email or password');
  };

  if (mode === 'landing') {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-5xl font-black tracking-tighter text-white mb-2">
            DEFINE<span className="text-[#00ff88]">OS</span>
          </h1>
          <p className="text-gray-500 mb-12">Build your body. Own your skills.</p>
          <div className="space-y-3">
            <button
              onClick={() => setMode('register')}
              className="w-full py-4 rounded-xl bg-[#00ff88] text-black font-bold text-base hover:bg-[#00dd77] transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
              Create Account <ChevronRight size={18} />
            </button>
            <button
              onClick={() => setMode('login')}
              className="w-full py-4 rounded-xl border border-white/15 text-white font-semibold hover:border-white/30 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex flex-col p-6">
        <button onClick={() => setMode('landing')} className="text-gray-500 text-sm mb-8 self-start">← Back</button>
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <h2 className="text-3xl font-black text-white mb-8">Welcome back</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">EMAIL</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#00ff88] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">PASSWORD</label>
              <div className="relative">
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#00ff88] transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass((v) => !v)}
                  className="absolute right-3 top-3.5 text-gray-500"
                >
                  {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button
              onClick={handleLogin}
              className="w-full py-4 rounded-xl bg-[#00ff88] text-black font-bold mt-2 hover:bg-[#00dd77] transition-colors active:scale-95"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Registration flow
  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col p-6">
      <button
        onClick={() => (step === 0 ? setMode('landing') : setStep((s) => (s - 1) as RegStep))}
        className="text-gray-500 text-sm mb-6 self-start"
      >
        ← Back
      </button>

      {/* Progress */}
      <div className="flex gap-1.5 mb-8 max-w-sm mx-auto w-full">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= step ? '#00ff88' : 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">

        {/* Step 0: Profile */}
        {step === 0 && (
          <div className="flex-1">
            <h2 className="text-2xl font-black text-white mb-1">Create your profile</h2>
            <p className="text-gray-500 text-sm mb-6">Start with the basics.</p>

            <div className="flex justify-center mb-6">
              <AvatarPicker value={profilePic} onChange={setProfilePic} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">USERNAME</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="athletename"
                  autoCapitalize="none"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6+ characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#00ff88] transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-3.5 text-gray-500"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            {regError && <p className="text-red-400 text-sm mt-3">{regError}</p>}
          </div>
        )}

        {/* Step 1: Level */}
        {step === 1 && (
          <div className="flex-1">
            <h2 className="text-2xl font-black text-white mb-1">Your level</h2>
            <p className="text-gray-500 text-sm mb-6">Be honest — this seeds your program.</p>
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

        {/* Step 2: Goals */}
        {step === 2 && (
          <div className="flex-1">
            <h2 className="text-2xl font-black text-white mb-1">Your goals</h2>
            <p className="text-gray-500 text-sm mb-6">Pick all that apply.</p>
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

        {/* Step 3: Baseline */}
        {step === 3 && (
          <div className="flex-1">
            <h2 className="text-2xl font-black text-white mb-1">Baseline check</h2>
            <p className="text-gray-500 text-sm mb-6">Best effort — unlocks your starting point.</p>
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

        {/* Nav */}
        <div className="pt-6">
          <button
            onClick={step < 3 ? nextStep : finishRegister}
            className="w-full py-4 rounded-xl bg-[#00ff88] text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-[#00dd77] transition-colors active:scale-95"
          >
            {step < 3 ? 'Continue' : 'Start Training'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
