/*
  # Health Tracking Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `gender` (text)
      - `height` (numeric)
      - `weight` (numeric)
      - `unit_preference` (text, default 'metric')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `vital_stats`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `blood_pressure_systolic` (integer)
      - `blood_pressure_diastolic` (integer)
      - `heart_rate` (integer)
      - `body_temperature` (numeric)
      - `weight` (numeric)
      - `recorded_at` (timestamp)
      - `created_at` (timestamp)
    
    - `bmi_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `height` (numeric)
      - `weight` (numeric)
      - `bmi` (numeric)
      - `category` (text)
      - `recorded_at` (timestamp)
      - `created_at` (timestamp)
    
    - `water_intake`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `glasses_consumed` (integer)
      - `goal` (integer, default 8)
      - `date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `medications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `name` (text)
      - `dosage` (text)
      - `frequency` (text)
      - `time` (time)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `medication_logs`
      - `id` (uuid, primary key)
      - `medication_id` (uuid, references medications)
      - `user_id` (uuid, references user_profiles)
      - `taken_at` (timestamp)
      - `date` (date)
      - `created_at` (timestamp)
    
    - `steps_tracking`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `steps` (integer)
      - `goal` (integer, default 10000)
      - `source` (text, default 'manual')
      - `date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `sleep_tracking`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `bed_time` (time)
      - `wake_time` (time)
      - `duration` (numeric)
      - `quality` (text)
      - `notes` (text)
      - `source` (text, default 'manual')
      - `date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `habits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `title` (text)
      - `emoji` (text)
      - `frequency` (text)
      - `custom_days` (text[])
      - `reminder_time` (time)
      - `reminder_enabled` (boolean, default true)
      - `category` (text)
      - `description` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `habit_completions`
      - `id` (uuid, primary key)
      - `habit_id` (uuid, references habits)
      - `user_id` (uuid, references user_profiles)
      - `completed_at` (timestamp)
      - `date` (date)
      - `created_at` (timestamp)
    
    - `journal_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `content` (text)
      - `gratitude` (text)
      - `mood` (text)
      - `date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data only
    - Add policies for real-time subscriptions
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name text NOT NULL,
  gender text CHECK (gender IN ('male', 'female', 'other')) DEFAULT 'female',
  height numeric,
  weight numeric,
  unit_preference text CHECK (unit_preference IN ('metric', 'imperial')) DEFAULT 'metric',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vital_stats table
CREATE TABLE IF NOT EXISTS vital_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  heart_rate integer,
  body_temperature numeric,
  weight numeric,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create bmi_records table
CREATE TABLE IF NOT EXISTS bmi_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  height numeric NOT NULL,
  weight numeric NOT NULL,
  bmi numeric NOT NULL,
  category text NOT NULL,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create water_intake table
CREATE TABLE IF NOT EXISTS water_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  glasses_consumed integer DEFAULT 0,
  goal integer DEFAULT 8,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medication_logs table
CREATE TABLE IF NOT EXISTS medication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid REFERENCES medications(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  taken_at timestamptz DEFAULT now(),
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(medication_id, date)
);

-- Create steps_tracking table
CREATE TABLE IF NOT EXISTS steps_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  steps integer DEFAULT 0,
  goal integer DEFAULT 10000,
  source text CHECK (source IN ('manual', 'device', 'gps')) DEFAULT 'manual',
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create sleep_tracking table
CREATE TABLE IF NOT EXISTS sleep_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bed_time time,
  wake_time time,
  duration numeric,
  quality text CHECK (quality IN ('poor', 'fair', 'good', 'excellent')),
  notes text,
  source text CHECK (source IN ('manual', 'device', 'auto')) DEFAULT 'manual',
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  emoji text DEFAULT '✅',
  frequency text CHECK (frequency IN ('daily', 'custom')) DEFAULT 'daily',
  custom_days text[],
  reminder_time time DEFAULT '09:00',
  reminder_enabled boolean DEFAULT true,
  category text DEFAULT 'Personal Growth',
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create habit_completions table
CREATE TABLE IF NOT EXISTS habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now(),
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, date)
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text,
  gratitude text,
  mood text,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for vital_stats
CREATE POLICY "Users can read own vital stats"
  ON vital_stats
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own vital stats"
  ON vital_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own vital stats"
  ON vital_stats
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for bmi_records
CREATE POLICY "Users can read own BMI records"
  ON bmi_records
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own BMI records"
  ON bmi_records
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policies for water_intake
CREATE POLICY "Users can read own water intake"
  ON water_intake
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own water intake"
  ON water_intake
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own water intake"
  ON water_intake
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for medications
CREATE POLICY "Users can read own medications"
  ON medications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own medications"
  ON medications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own medications"
  ON medications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own medications"
  ON medications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for medication_logs
CREATE POLICY "Users can read own medication logs"
  ON medication_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own medication logs"
  ON medication_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own medication logs"
  ON medication_logs
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own medication logs"
  ON medication_logs
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for steps_tracking
CREATE POLICY "Users can read own steps tracking"
  ON steps_tracking
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own steps tracking"
  ON steps_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own steps tracking"
  ON steps_tracking
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for sleep_tracking
CREATE POLICY "Users can read own sleep tracking"
  ON sleep_tracking
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sleep tracking"
  ON sleep_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sleep tracking"
  ON sleep_tracking
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for habits
CREATE POLICY "Users can read own habits"
  ON habits
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own habits"
  ON habits
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own habits"
  ON habits
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own habits"
  ON habits
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for habit_completions
CREATE POLICY "Users can read own habit completions"
  ON habit_completions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own habit completions"
  ON habit_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own habit completions"
  ON habit_completions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own habit completions"
  ON habit_completions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for journal_entries
CREATE POLICY "Users can read own journal entries"
  ON journal_entries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own journal entries"
  ON journal_entries
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_vital_stats_user_id ON vital_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_vital_stats_recorded_at ON vital_stats(recorded_at);
CREATE INDEX IF NOT EXISTS idx_bmi_records_user_id ON bmi_records(user_id);
CREATE INDEX IF NOT EXISTS idx_bmi_records_recorded_at ON bmi_records(recorded_at);
CREATE INDEX IF NOT EXISTS idx_water_intake_user_id_date ON water_intake(user_id, date);
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id_date ON medication_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_steps_tracking_user_id_date ON steps_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sleep_tracking_user_id_date ON sleep_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id_date ON habit_completions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id_date ON journal_entries(user_id, date);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_water_intake_updated_at BEFORE UPDATE ON water_intake FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_steps_tracking_updated_at BEFORE UPDATE ON steps_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sleep_tracking_updated_at BEFORE UPDATE ON sleep_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();