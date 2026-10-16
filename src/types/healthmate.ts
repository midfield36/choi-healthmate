export type UserLevel = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutGoal = 'hypertrophy' | 'fat_loss' | 'strength' | 'rehab';
export type WorkoutPlace = 'gym' | 'home' | 'outdoor';

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
}

export interface WorkoutRoutineResponse {
  routineTitle: string;
  summary: string;
  targetLevel: UserLevel;
  estimatedDurationMinutes: number;
  warmUp: string[];
  exercises: ExerciseDetail[];
  coolDown: string[];
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
