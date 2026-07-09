import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const hasValidConfig = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url_here' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  isValidUrl(supabaseUrl)

if (!hasValidConfig) {
  console.warn('⚠️ Supabase environment variables are missing or invalid.')
  console.warn('Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
  console.warn('Check your .env file — see .env.example for the format.')
}

// Always create a client — if config is invalid, operations will fail gracefully
// This prevents null reference errors throughout the codebase
export const supabase: SupabaseClient = hasValidConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

export const hasSupabaseConfig = hasValidConfig

// Database types
export interface UserProfile {
  id: string
  user_id: string
  name: string
  gender: 'male' | 'female' | 'other'
  height?: number
  weight?: number
  unit_preference: 'metric' | 'imperial'
  created_at: string
  updated_at: string
}

export interface VitalStats {
  id: string
  user_id: string
  blood_pressure_systolic?: number
  blood_pressure_diastolic?: number
  heart_rate?: number
  body_temperature?: number
  weight?: number
  recorded_at: string
  created_at: string
}

export interface BMIRecord {
  id: string
  user_id: string
  height: number
  weight: number
  bmi: number
  category: string
  recorded_at: string
  created_at: string
}

export interface WaterIntake {
  id: string
  user_id: string
  glasses_consumed: number
  goal: number
  date: string
  created_at: string
  updated_at: string
}

export interface Medication {
  id: string
  user_id: string
  name: string
  dosage: string
  frequency: string
  time: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MedicationLog {
  id: string
  medication_id: string
  user_id: string
  taken_at: string
  date: string
  created_at: string
}

export interface StepsTracking {
  id: string
  user_id: string
  steps: number
  goal: number
  source: 'manual' | 'device' | 'gps'
  date: string
  created_at: string
  updated_at: string
}

export interface SleepTracking {
  id: string
  user_id: string
  bed_time?: string
  wake_time?: string
  duration?: number
  quality?: 'poor' | 'fair' | 'good' | 'excellent'
  notes?: string
  source: 'manual' | 'device' | 'auto'
  date: string
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  title: string
  emoji: string
  frequency: 'daily' | 'custom'
  custom_days?: string[]
  reminder_time: string
  reminder_enabled: boolean
  category: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  date: string
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  content?: string
  gratitude?: string
  mood?: string
  date: string
  created_at: string
  updated_at: string
}