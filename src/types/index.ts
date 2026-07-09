export interface User {
  name: string;
  xp: number;
  level: number;
  streak: number;
  gender: 'male' | 'female' | 'other';
}

export interface HealthStats {
  waterIntake: number;
  waterGoal: number;
  mood: string;
  stepsToday: number;
  sleepHours: number;
  medicationsTaken: number;
  medicationsTotal: number;
}

export type Language = 'en' | 'hi';

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}