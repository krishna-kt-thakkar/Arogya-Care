import { useState, useEffect } from 'react'
import { supabase, WaterIntake, StepsTracking, SleepTracking, VitalStats, BMIRecord, Medication, MedicationLog } from '../lib/supabase'
import { useSupabaseAuth } from './useSupabaseAuth'

export function useHealthData() {
  const { user } = useSupabaseAuth()
  const [loading, setLoading] = useState(false)

  // Water Intake
  const getWaterIntake = async (date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) return null

    const { data, error } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle()

    if (error) throw error
    return data
  }

  const updateWaterIntake = async (glasses: number, date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) return

    const { data, error } = await supabase
      .from('water_intake')
      .upsert({
        user_id: user.id,
        glasses_consumed: glasses,
        date,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const getWeeklyWaterIntake = async () => {
    if (!user) return []

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 6)

    const { data, error } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Steps Tracking
  const getStepsTracking = async (date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) return null

    const { data, error } = await supabase
      .from('steps_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle()

    if (error) throw error
    return data
  }

  const updateStepsTracking = async (steps: number, source: 'manual' | 'device' | 'gps' = 'manual', date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) return

    const { data, error } = await supabase
      .from('steps_tracking')
      .upsert({
        user_id: user.id,
        steps,
        source,
        date,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const getWeeklyStepsTracking = async () => {
    if (!user) return []

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 6)

    const { data, error } = await supabase
      .from('steps_tracking')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Sleep Tracking
  const getSleepTracking = async (date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) return null

    const { data, error } = await supabase
      .from('sleep_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle()

    if (error) throw error
    return data
  }

  const updateSleepTracking = async (sleepData: Partial<SleepTracking>, date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) return

    const { data, error } = await supabase
      .from('sleep_tracking')
      .upsert({
        user_id: user.id,
        ...sleepData,
        date,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const getWeeklySleepTracking = async () => {
    if (!user) return []

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 6)

    const { data, error } = await supabase
      .from('sleep_tracking')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Vital Stats
  const getLatestVitalStats = async () => {
    if (!user) return null

    const { data, error } = await supabase
      .from('vital_stats')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data
  }

  const saveVitalStats = async (vitalData: Partial<VitalStats>) => {
    if (!user) return

    const { data, error } = await supabase
      .from('vital_stats')
      .insert({
        user_id: user.id,
        ...vitalData,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // BMI Records
  const getBMIHistory = async (limit: number = 10) => {
    if (!user) return []

    const { data, error } = await supabase
      .from('bmi_records')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  const saveBMIRecord = async (bmiData: Partial<BMIRecord>) => {
    if (!user) return

    const { data, error } = await supabase
      .from('bmi_records')
      .insert({
        user_id: user.id,
        ...bmiData,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Medications
  const getMedications = async () => {
    if (!user) return []

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  const addMedication = async (medicationData: Partial<Medication>) => {
    if (!user) return

    const { data, error } = await supabase
      .from('medications')
      .insert({
        user_id: user.id,
        ...medicationData,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const deleteMedication = async (medicationId: string) => {
    if (!user) return

    const { error } = await supabase
      .from('medications')
      .update({ is_active: false })
      .eq('id', medicationId)
      .eq('user_id', user.id)

    if (error) throw error
  }

  const getMedicationLogs = async (date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) return []

    const { data, error } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)

    if (error) throw error
    return data || []
  }

  const logMedicationTaken = async (medicationId: string, date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) return

    const { data, error } = await supabase
      .from('medication_logs')
      .upsert({
        medication_id: medicationId,
        user_id: user.id,
        date,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const removeMedicationLog = async (medicationId: string, date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) return

    const { error } = await supabase
      .from('medication_logs')
      .delete()
      .eq('medication_id', medicationId)
      .eq('user_id', user.id)
      .eq('date', date)

    if (error) throw error
  }

  return {
    loading,
    // Water
    getWaterIntake,
    updateWaterIntake,
    getWeeklyWaterIntake,
    // Steps
    getStepsTracking,
    updateStepsTracking,
    getWeeklyStepsTracking,
    // Sleep
    getSleepTracking,
    updateSleepTracking,
    getWeeklySleepTracking,
    // Vitals
    getLatestVitalStats,
    saveVitalStats,
    // BMI
    getBMIHistory,
    saveBMIRecord,
    // Medications
    getMedications,
    addMedication,
    deleteMedication,
    getMedicationLogs,
    logMedicationTaken,
    removeMedicationLog,
  }
}