export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type Goal = 'strength' | 'skill' | 'aesthetics' | 'flexibility';
export type Track = 'push' | 'pull' | 'core' | 'legs';
export type NodeState = 'locked' | 'unlocked' | 'mastered';
export type Effort = 1 | 2 | 3 | 4 | 5;

export interface SkillNode {
  id: string;
  name: string;
  track: Track;
  level: number;
  state: NodeState;
  prerequisites: string[];
  formCues: string[];
  strengthStandard: string;
  isIsometric: boolean;
  description: string;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  reps?: number;
  holdTime?: number;
  effort: Effort;
}

export interface WorkoutSession {
  id: string;
  date: string;
  sets: WorkoutSet[];
}

export interface PersonalBest {
  exerciseId: string;
  exerciseName: string;
  reps?: number;
  holdTime?: number;
  date: string;
}

export interface BaselineAnswers {
  pullUps: number;
  pushUps: number;
  dips: number;
  hangTime: number;
}

export interface AppState {
  onboardingComplete: boolean;
  skillLevel: SkillLevel;
  goals: Goal[];
  baseline: BaselineAnswers;
  nodeStates: Record<string, NodeState>;
  sessions: WorkoutSession[];
  personalBests: PersonalBest[];
  streak: number;
  lastWorkoutDate: string | null;
}
