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

export type Language = 'en' | 'hi' | 'hinglish' | 'te' | 'gu' | 'es' | 'fr' | 'de';

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    hinglish: string;
    te: string;
    gu: string;
    es: string;
    fr: string;
    de: string;
  };
}