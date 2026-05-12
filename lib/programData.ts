import type { SkillLevel } from './types';

interface ProgramBlock {
  title: string;
  duration: string;
  exercises: { name: string; sets?: number; reps?: string; rest?: string; note?: string }[];
  coachingNotes: string;
}

export function getDailyProgram(level: SkillLevel, goals: string[]): ProgramBlock[] {
  const programs: Record<SkillLevel, ProgramBlock[]> = {
    beginner: [
      {
        title: 'Warm-Up',
        duration: '8 min',
        exercises: [
          { name: 'Arm Circles', reps: '20 each direction' },
          { name: 'Shoulder Rolls', reps: '10 forward, 10 back' },
          { name: 'Hip Circles', reps: '10 each direction' },
          { name: 'Leg Swings', reps: '10 each leg' },
          { name: 'Cat-Cow', reps: '10 reps' },
        ],
        coachingNotes: 'Move slowly and deliberately. Focus on joint mobility, not speed. Increase range of motion gradually over 8 minutes.',
      },
      {
        title: 'Skill Work',
        duration: '15 min',
        exercises: [
          { name: 'Dead Hang', sets: 4, reps: '20 sec hold', rest: '60s' },
          { name: 'Hollow Body Hold', sets: 3, reps: '20 sec hold', rest: '60s' },
          { name: 'Wall Push-Up', sets: 3, reps: '15 reps', rest: '45s' },
        ],
        coachingNotes: 'Skill work is about quality, not fatigue. Stop before form breaks down. These positions build the neural patterns you need for harder skills.',
      },
      {
        title: 'Strength Work',
        duration: '20 min',
        exercises: [
          { name: 'Knee Push-Up', sets: 3, reps: '12 reps', rest: '90s' },
          { name: 'Australian Pull-Up', sets: 3, reps: '8 reps', rest: '90s' },
          { name: 'Bodyweight Squat', sets: 3, reps: '20 reps', rest: '60s' },
          { name: 'Dead Bug', sets: 3, reps: '8 each side', rest: '60s' },
        ],
        coachingNotes: 'Rest fully between sets — strength adaptations happen during recovery. If a set feels too easy, slow the eccentric (lowering) phase to 3 seconds.',
      },
      {
        title: 'Cool-Down',
        duration: '7 min',
        exercises: [
          { name: 'Chest Stretch', reps: '30 sec each side' },
          { name: 'Lat Stretch', reps: '30 sec each side' },
          { name: 'Hip Flexor Stretch', reps: '45 sec each side' },
          { name: 'Child\'s Pose', reps: '60 sec' },
        ],
        coachingNotes: 'Breathe into each stretch. Never force a stretch — hold at mild tension. This is where flexibility gains happen.',
      },
    ],
    intermediate: [
      {
        title: 'Warm-Up',
        duration: '10 min',
        exercises: [
          { name: 'Band Shoulder Dislocates', reps: '15 reps' },
          { name: 'Wrist Circles & Flexion', reps: '60 sec each direction' },
          { name: 'Squat to Stand', reps: '10 reps' },
          { name: 'Inchworm', reps: '8 reps' },
          { name: 'World\'s Greatest Stretch', reps: '5 each side' },
        ],
        coachingNotes: 'At intermediate level, warm-up quality directly impacts skill performance. Spend extra time on wrists — they take heavy load during push skill work.',
      },
      {
        title: 'Skill Work',
        duration: '20 min',
        exercises: [
          { name: 'Tuck Front Lever', sets: 5, reps: '8 sec hold', rest: '90s', note: 'Rest 90s between attempts' },
          { name: 'L-Sit', sets: 4, reps: '10 sec hold', rest: '90s' },
          { name: 'Pseudo Planche Lean', sets: 4, reps: '15 sec hold', rest: '90s' },
        ],
        coachingNotes: 'Skill holds should be max 80% effort to avoid nervous system fatigue. End each set feeling like you have 3–5 more seconds in the tank.',
      },
      {
        title: 'Strength Work',
        duration: '25 min',
        exercises: [
          { name: 'Pull-Up', sets: 4, reps: '8 reps', rest: '2 min' },
          { name: 'Pseudo Planche Push-Up', sets: 4, reps: '8 reps', rest: '2 min' },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '10 each leg', rest: '90s' },
          { name: 'Ab Wheel Rollout', sets: 3, reps: '8 reps', rest: '90s' },
        ],
        coachingNotes: 'At intermediate level, 2 minutes rest is the minimum for strength work. Compound movements need full CNS recovery to produce quality contractions.',
      },
      {
        title: 'Cool-Down',
        duration: '8 min',
        exercises: [
          { name: 'Pancake Stretch', reps: '60 sec' },
          { name: 'Shoulder Extension Stretch', reps: '45 sec each side' },
          { name: 'Pigeon Pose', reps: '60 sec each side' },
          { name: 'Wrist Flexor Stretch', reps: '45 sec each side' },
        ],
        coachingNotes: 'Flexibility is a skill that needs consistent training. 5–7 days/week of stretching is ideal. Today\'s cool-down is your minimum.',
      },
    ],
    advanced: [
      {
        title: 'Warm-Up',
        duration: '12 min',
        exercises: [
          { name: 'Skin the Cat', reps: '5 reps' },
          { name: 'German Hang', reps: '30 sec hold' },
          { name: 'Wrist Prep Circuit', reps: '2 min' },
          { name: 'Shoulder Bridge', reps: '8 reps' },
          { name: 'Crab Walk', reps: '15m each direction' },
        ],
        coachingNotes: 'Advanced warm-up integrates active mobility under load. Skin the Cat and German Hang are essential shoulder prep for lever and planche work.',
      },
      {
        title: 'Skill Work',
        duration: '25 min',
        exercises: [
          { name: 'Planche / Tuck Planche', sets: 6, reps: '8 sec hold', rest: '2 min' },
          { name: 'Back Lever', sets: 5, reps: '6 sec hold', rest: '2 min' },
          { name: 'Dragon Flag', sets: 4, reps: '5 reps', rest: '2 min' },
        ],
        coachingNotes: 'At advanced level, skill sessions are the priority — not accessory work. If skill quality drops, end the session. Fatigue compromises neural pattern quality.',
      },
      {
        title: 'Strength Work',
        duration: '20 min',
        exercises: [
          { name: 'Chest-to-Bar Pull-Up', sets: 5, reps: '5 reps', rest: '3 min' },
          { name: 'Archer Push-Up', sets: 4, reps: '6 each side', rest: '2 min' },
          { name: 'Pistol Squat', sets: 4, reps: '5 each leg', rest: '2 min' },
        ],
        coachingNotes: 'Heavy, low-rep work. Every rep should feel crisp and powerful. If you lose tension or form, rack it and rest another minute.',
      },
      {
        title: 'Cool-Down',
        duration: '10 min',
        exercises: [
          { name: 'Full Splits Work', reps: '90 sec each side' },
          { name: 'Shoulder Flexion Stretch', reps: '60 sec' },
          { name: 'Thoracic Extension', reps: '60 sec' },
          { name: 'Hip 90/90 Stretch', reps: '60 sec each position' },
        ],
        coachingNotes: 'Advanced athletes need advanced flexibility. Aim to improve splits and shoulder mobility monthly — it directly enables front lever and planche progressions.',
      },
    ],
  };

  return programs[level];
}
