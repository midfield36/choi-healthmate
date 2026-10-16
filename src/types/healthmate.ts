export type UserLevel = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutGoal = 'hypertrophy' | 'fat_loss' | 'strength' | 'rehab';
export type WorkoutPlace = 'gym' | 'home' | 'outdoor';

export interface ExerciseStepGuide {
  step: number;
  title: string;
  description: string;
}

export interface ExerciseDetail {
  name: string;
  targetMuscle: string;
  sets: number;
  reps: string;
  restSeconds: number;
  equipment: string;
  equipmentGuide: string;
  executionTips: string[];
  alternativeExercise?: string;
  videoSearchQuery?: string;
  videoUrl?: string;
  stepGuide?: ExerciseStepGuide[];
  commonMistakes?: string[];
}

export interface WorkoutRoutineResponse {
  routineTitle: string;
  summary: string;
  targetLevel: UserLevel;
  estimatedDurationMinutes: number;
  warmUp: string[];
  exercises: ExerciseDetail[];
  coolDown: string[];
  aiAdaptationNote?: string;
}

export interface RoutineFeedback {
  id: string;
  routineTitle: string;
  difficulty: 'too_easy' | 'just_right' | 'too_hard';
  satisfaction: number; // 1 to 5
  feedbackText: string;
  date: string;
}

export interface WorkoutSet {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface LoggedExercise {
  name: string;
  targetMuscle?: string;
  sets: WorkoutSet[];
}

export interface WorkoutLogItem {
  id: string;
  date: string;
  routineTitle: string;
  durationMinutes: number;
  exercises: LoggedExercise[];
  memo?: string;
  completedAt?: string;
}

export interface BodyRecord {
  id: string;
  date: string;
  weight: number;
  skeletalMuscleMass: number;
  bodyFatPercentage: number;
}

export interface Gym {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  phone: string;
  monthlyFee: string;
  dailyPassFee: string;
  is24Hours: boolean;
}

// Community & Social types
export interface ChallengeItem {
  id: string;
  title: string;
  category: '출석' | '볼륨' | '스트렝스' | '다이어트';
  description: string;
  rewardBadge: string;
  participantsCount: number;
  daysLeft: number;
  myProgress: number; // e.g. 75%
  targetGoal: string;
  isJoined: boolean;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatarText: string;
  level: string;
  weeklyVolumeKg: number;
  attendanceStreak: number;
  badge: string;
  isMe?: boolean;
}

export interface WorkoutPartner {
  id: string;
  name: string;
  avatarText: string;
  level: string;
  goal: string;
  preferredTime: string;
  preferredGym: string;
  distanceKm: number;
  bio: string;
  matchScore: number;
  status: 'online' | 'active_now' | 'offline';
  isRequested?: boolean;
}
