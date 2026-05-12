import { SKILL_NODES } from './skillData';
import type { NodeState, SkillLevel, BaselineAnswers } from './types';

export function computeInitialNodeStates(
  level: SkillLevel,
  baseline: BaselineAnswers
): Record<string, NodeState> {
  const states: Record<string, NodeState> = {};

  // All nodes start locked
  SKILL_NODES.forEach((n) => { states[n.id] = 'locked'; });

  // Entry-level nodes are always unlocked
  SKILL_NODES.filter((n) => n.prerequisites.length === 0).forEach((n) => {
    states[n.id] = 'unlocked';
  });

  // Seed mastered nodes based on baseline
  if (baseline.pullUps >= 5) {
    states['dead-hang'] = 'mastered';
    states['scapular-pull'] = 'mastered';
    states['australian-pull-up'] = 'mastered';
    states['pull-up'] = baseline.pullUps >= 10 ? 'mastered' : 'unlocked';
  }
  if (baseline.pushUps >= 10) {
    states['wall-push-up'] = 'mastered';
    states['knee-push-up'] = 'mastered';
    states['push-up'] = baseline.pushUps >= 20 ? 'mastered' : 'unlocked';
  }
  if (baseline.dips >= 5) {
    states['diamond-push-up'] = 'unlocked';
    states['pike-push-up'] = 'unlocked';
  }
  if (baseline.hangTime >= 30) {
    states['dead-hang'] = states['dead-hang'] === 'mastered' ? 'mastered' : 'unlocked';
  }

  // Unlock nodes whose prerequisites are all mastered
  let changed = true;
  while (changed) {
    changed = false;
    SKILL_NODES.forEach((node) => {
      if (states[node.id] === 'locked') {
        const allPrereqsMastered = node.prerequisites.every((p) => states[p] === 'mastered');
        if (allPrereqsMastered && node.prerequisites.length > 0) {
          states[node.id] = 'unlocked';
          changed = true;
        }
      }
    });
  }

  return states;
}

export function canUnlockNode(nodeId: string, nodeStates: Record<string, NodeState>): boolean {
  const node = SKILL_NODES.find((n) => n.id === nodeId);
  if (!node) return false;
  return node.prerequisites.every((p) => nodeStates[p] === 'mastered');
}

export function getTrackProgress(track: string, nodeStates: Record<string, NodeState>): number {
  const trackNodes = SKILL_NODES.filter((n) => n.track === track);
  if (trackNodes.length === 0) return 0;
  const mastered = trackNodes.filter((n) => nodeStates[n.id] === 'mastered').length;
  return Math.round((mastered / trackNodes.length) * 100);
}

export function getReadinessScore(lastWorkoutDate: string | null, streak: number): number {
  if (!lastWorkoutDate) return 95;
  const daysSince = Math.floor(
    (Date.now() - new Date(lastWorkoutDate).getTime()) / 86400000
  );
  if (daysSince === 0) return 60; // trained today
  if (daysSince === 1) return 85;
  if (daysSince === 2) return 95;
  if (daysSince === 3) return 90;
  return Math.max(70, 90 - (daysSince - 3) * 5);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}
