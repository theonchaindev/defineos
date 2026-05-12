'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type {
  AppState, SkillLevel, Goal, BaselineAnswers, NodeState,
  WorkoutSession, WorkoutSet, PersonalBest, User, Run,
} from '@/lib/types';
import { computeInitialNodeStates, todayStr } from '@/lib/utils';
import { SKILL_NODES } from '@/lib/skillData';

const DEFAULT_STATE: AppState = {
  user: null,
  authComplete: false,
  skillLevel: 'beginner',
  goals: [],
  baseline: { pullUps: 0, pushUps: 0, dips: 0, hangTime: 0 },
  nodeStates: {},
  sessions: [],
  personalBests: [],
  runs: [],
  streak: 0,
  lastWorkoutDate: null,
};

interface AppContextValue {
  state: AppState;
  register: (user: User, level: SkillLevel, goals: Goal[], baseline: BaselineAnswers) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  saveSession: (sets: WorkoutSet[]) => void;
  markNodeMastered: (nodeId: string) => void;
  saveRun: (run: Run) => void;
  deleteRun: (runId: string) => void;
  resetApp: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('defineos_state_v2');
      if (saved) setState(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem('defineos_state_v2', JSON.stringify(state));
  }, [state, loaded]);

  const register = useCallback(
    (user: User, level: SkillLevel, goals: Goal[], baseline: BaselineAnswers) => {
      const nodeStates = computeInitialNodeStates(level, baseline);
      setState((prev) => ({
        ...prev,
        user,
        authComplete: true,
        skillLevel: level,
        goals,
        baseline,
        nodeStates,
      }));
    },
    []
  );

  const login = useCallback((email: string, password: string): boolean => {
    // For localStorage auth, check if current stored user matches
    const saved = localStorage.getItem('defineos_state_v2');
    if (!saved) return false;
    const parsed: AppState = JSON.parse(saved);
    if (
      parsed.user &&
      parsed.user.email.toLowerCase() === email.toLowerCase() &&
      parsed.user.password === password
    ) {
      setState(parsed);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, authComplete: false }));
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : prev.user,
    }));
  }, []);

  const saveSession = useCallback((sets: WorkoutSet[]) => {
    const today = todayStr();
    const session: WorkoutSession = { id: Date.now().toString(), date: today, sets };
    setState((prev) => {
      const newStreak =
        prev.lastWorkoutDate === today
          ? prev.streak
          : prev.lastWorkoutDate &&
            new Date(today).getTime() - new Date(prev.lastWorkoutDate).getTime() <= 86400000 * 2
          ? prev.streak + 1
          : 1;

      const newPBs = [...prev.personalBests];
      sets.forEach((set) => {
        const existing = newPBs.find((pb) => pb.exerciseId === set.exerciseId);
        const isBetter =
          !existing ||
          (set.reps && (!existing.reps || set.reps > existing.reps)) ||
          (set.holdTime && (!existing.holdTime || set.holdTime > existing.holdTime));
        if (isBetter) {
          const idx = newPBs.findIndex((pb) => pb.exerciseId === set.exerciseId);
          const pb: PersonalBest = {
            exerciseId: set.exerciseId,
            exerciseName: set.exerciseName,
            reps: set.reps,
            holdTime: set.holdTime,
            date: today,
          };
          if (idx >= 0) newPBs[idx] = pb;
          else newPBs.push(pb);
        }
      });

      return {
        ...prev,
        sessions: [...prev.sessions, session],
        personalBests: newPBs,
        streak: newStreak,
        lastWorkoutDate: today,
      };
    });
  }, []);

  const markNodeMastered = useCallback((nodeId: string) => {
    setState((prev) => {
      const newNodeStates = { ...prev.nodeStates, [nodeId]: 'mastered' as NodeState };
      SKILL_NODES.forEach((node) => {
        if (
          node.prerequisites.includes(nodeId) &&
          node.prerequisites.every((p) => newNodeStates[p] === 'mastered') &&
          newNodeStates[node.id] === 'locked'
        ) {
          newNodeStates[node.id] = 'unlocked';
        }
      });
      return { ...prev, nodeStates: newNodeStates };
    });
  }, []);

  const saveRun = useCallback((run: Run) => {
    setState((prev) => ({ ...prev, runs: [run, ...prev.runs] }));
  }, []);

  const deleteRun = useCallback((runId: string) => {
    setState((prev) => ({ ...prev, runs: prev.runs.filter((r) => r.id !== runId) }));
  }, []);

  const resetApp = useCallback(() => {
    localStorage.removeItem('defineos_state_v2');
    setState(DEFAULT_STATE);
  }, []);

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{ state, register, login, logout, updateProfile, saveSession, markNodeMastered, saveRun, deleteRun, resetApp }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
