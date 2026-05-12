export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type Goal = 'strength' | 'skill' | 'aesthetics' | 'flexibility';
export type Track = 'push' | 'pull' | 'core' | 'legs';
export type NodeState = 'locked' | 'unlocked' | 'mastered';
export type Effort = 1 | 2 | 3 | 4 | 5;

export interface User {
  username: string;
  email: string;
  password: string; // stored as-is (localStorage only, no backend)
  profilePic: string | null; // base64 data URL
  joinedAt: string;
}

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
  caption?: string;
  photo?: string; // base64 data URL
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

export interface RunPoint {
  lat: number;
  lng: number;
  timestamp: number;
  altitude?: number;
}

export interface Run {
  id: string;
  date: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  distanceMeters: number;
  points: RunPoint[];
  avgPaceSecPerKm: number;
  title?: string;
}

export interface BaselineAnswers {
  pullUps: number;
  pushUps: number;
  dips: number;
  hangTime: number;
}

export interface AppState {
  user: User | null;
  authComplete: boolean;
  skillLevel: SkillLevel;
  goals: Goal[];
  baseline: BaselineAnswers;
  nodeStates: Record<string, NodeState>;
  sessions: WorkoutSession[];
  personalBests: PersonalBest[];
  runs: Run[];
  streak: number;
  lastWorkoutDate: string | null;
}
