import { useState, useEffect, useCallback } from 'react'
import { supabase, WaterIntake, StepsTracking, SleepTracking, VitalStats, BMIRecord, Medication, MedicationLog } from '../lib/supabase'
import { useSupabaseAuth } from './useSupabaseAuth'

export function useHealthData() {
  const { user } = useSupabaseAuth()
  const [loading, setLoading] = useState(false)

  // Water Intake
  const getWaterIntake = useCallback(async (date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) return null

    const { data, error } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle()

    if (error) throw error
    return data
  }, [user?.id])

  const updateWaterIntake = useCallback(async (glasses: number, date: string = new Date().toISOString().split('T')[0]) => {
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
  }, [user?.id])

  const getWeeklyWaterIntake = useCallback(async () => {
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
  }, [user?.id])

  // Steps Tracking
  const getStepsTracking = useCallback(async (date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) return null

    const { data, error } = await supabase
      .from('steps_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle()

    if (error) throw error
    return data
  }, [user?.id])

  const updateStepsTracking = useCallback(async (steps: number, source: 'manual' | 'device' | 'gps' = 'manual', date: string = new Date().toISOString().split('T')[0]) => {
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
  }, [user?.id])

  const getWeeklyStepsTracking = useCallback(async () => {
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
  }, [user?.id])

  // Sleep Tracking
  const getSleepTracking = useCallback(async (date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) return null

    const { data, error } = await supabase
      .from('sleep_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle()

    if (error) throw error
    return data
  }, [user?.id])

  const updateSleepTracking = useCallback(async (sleepData: Partial<SleepTracking>, date: string = new Date().toISOString().split('T')[0]) => {
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
  }, [user?.id])

  const getWeeklySleepTracking = useCallback(async () => {
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
  }, [user?.id])

  // Vital Stats
  const getLatestVitalStats = useCallback(async () => {
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
  }, [user?.id])

  const saveVitalStats = useCallback(async (vitalData: Partial<VitalStats>) => {
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
  }, [user?.id])

  // BMI Records
  const getBMIHistory = useCallback(async (limit: number = 10) => {
    if (!user) return []

    const { data, error } = await supabase
      .from('bmi_records')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }, [user?.id])

  const saveBMIRecord = useCallback(async (bmiData: Partial<BMIRecord>) => {
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
  }, [user?.id])

  // Medications
  const getMedications = useCallback(async () => {
    if (!user) return []

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }, [user?.id])

  const addMedication = useCallback(async (medicationData: Partial<Medication>) => {
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
  }, [user?.id])

  const deleteMedication = useCallback(async (medicationId: string) => {
    if (!user) return

    const { error } = await supabase
      .from('medications')
      .update({ is_active: false })
      .eq('id', medicationId)
      .eq('user_id', user.id)

    if (error) throw error
  }, [user?.id])

  const getMedicationLogs = useCallback(async (date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) return []

    const { data, error } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)

    if (error) throw error
    return data || []
  }, [user?.id])

  const logMedicationTaken = useCallback(async (medicationId: string, date: string = new Date().toISOString().split('T')[0]) => {
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
  }, [user?.id])

  const removeMedicationLog = useCallback(async (medicationId: string, date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) return

    const { error } = await supabase
      .from('medication_logs')
      .delete()
      .eq('medication_id', medicationId)
      .eq('user_id', user.id)
      .eq('date', date)

    if (error) throw error
  }, [user?.id])

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