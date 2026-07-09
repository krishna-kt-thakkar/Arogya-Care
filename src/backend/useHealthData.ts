import { useCallback } from 'react';
import {
  doc, getDoc, setDoc, getDocs,
  collection, query, where, orderBy,
  deleteDoc
} from 'firebase/firestore';
import { db, hasFirebaseConfig } from './firebase';
import { useAuth } from '../contexts/AuthContext';

export function useHealthData() {
  const { user } = useAuth();

  // Helper: get user's subcollection reference
  const userCol = useCallback((colName: string) => {
    if (!user || !hasFirebaseConfig) return null;
    try {
      return collection(db, 'users', user.id, colName);
    } catch {
      return null;
    }
  }, [user?.id]);

  // ---- Water Intake ----
  const getWaterIntake = useCallback(async (date: string = new Date().toISOString().split('T')[0]) => {
    if (!user || !hasFirebaseConfig) return null;
    try {
      const ref = doc(db, 'users', user.id, 'water_intake', date);
      const snap = await getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (e) {
      console.warn('Firestore offline fallback for Water Intake:', e);
      return null;
    }
  }, [user?.id]);

  const updateWaterIntake = useCallback(async (glasses: number, date: string = new Date().toISOString().split('T')[0]) => {
    if (!user || !hasFirebaseConfig) return;
    try {
      const ref = doc(db, 'users', user.id, 'water_intake', date);
      await setDoc(ref, {
        user_id: user.id,
        glasses_consumed: glasses,
        goal: 8,
        date,
        updated_at: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore offline save fallback for Water Intake:', e);
    }
  }, [user?.id]);

  const getWeeklyWaterIntake = useCallback(async () => {
    if (!user || !hasFirebaseConfig) return [];
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const col = userCol('water_intake');
      if (!col) return [];
      const q = query(col, where('date', '>=', startStr), where('date', '<=', endStr), orderBy('date', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Firestore offline fallback for weekly Water Intake:', e);
      return [];
    }
  }, [user?.id, userCol]);

  // ---- Steps Tracking ----
  const getStepsTracking = useCallback(async (date: string = new Date().toISOString().split('T')[0]) => {
    if (!user || !hasFirebaseConfig) return null;
    try {
      const ref = doc(db, 'users', user.id, 'steps_tracking', date);
      const snap = await getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (e) {
      console.warn('Firestore offline fallback for Steps Tracking:', e);
      return null;
    }
  }, [user?.id]);

  const updateStepsTracking = useCallback(async (steps: number, source: 'manual' | 'device' | 'gps' = 'manual', date: string = new Date().toISOString().split('T')[0]) => {
    if (!user || !hasFirebaseConfig) return;
    try {
      const ref = doc(db, 'users', user.id, 'steps_tracking', date);
      await setDoc(ref, {
        user_id: user.id,
        steps,
        goal: 10000,
        source,
        date,
        updated_at: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore offline save fallback for Steps Tracking:', e);
    }
  }, [user?.id]);

  const getWeeklyStepsTracking = useCallback(async () => {
    if (!user || !hasFirebaseConfig) return [];
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const col = userCol('steps_tracking');
      if (!col) return [];
      const q = query(col, where('date', '>=', startStr), where('date', '<=', endStr), orderBy('date', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Firestore offline fallback for weekly Steps Tracking:', e);
      return [];
    }
  }, [user?.id, userCol]);

  // ---- Sleep Tracking ----
  const getSleepTracking = useCallback(async (date: string = new Date().toISOString().split('T')[0]) => {
    if (!user || !hasFirebaseConfig) return null;
    try {
      const ref = doc(db, 'users', user.id, 'sleep_tracking', date);
      const snap = await getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (e) {
      console.warn('Firestore offline fallback for Sleep Tracking:', e);
      return null;
    }
  }, [user?.id]);

  const updateSleepTracking = useCallback(async (sleepData: any, date: string = new Date().toISOString().split('T')[0]) => {
    if (!user || !hasFirebaseConfig) return;
    try {
      const ref = doc(db, 'users', user.id, 'sleep_tracking', date);
      await setDoc(ref, {
        user_id: user.id,
        ...sleepData,
        date,
        updated_at: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore offline save fallback for Sleep Tracking:', e);
    }
  }, [user?.id]);

  const getWeeklySleepTracking = useCallback(async () => {
    if (!user || !hasFirebaseConfig) return [];
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const col = userCol('sleep_tracking');
      if (!col) return [];
      const q = query(col, where('date', '>=', startStr), where('date', '<=', endStr), orderBy('date', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Firestore offline fallback for weekly Sleep Tracking:', e);
      return [];
    }
  }, [user?.id, userCol]);

  // ---- Vital Stats ----
  const getLatestVitalStats = useCallback(async () => {
    if (!user || !hasFirebaseConfig) return null;
    try {
      const col = userCol('vital_stats');
      if (!col) return null;
      const q = query(col, orderBy('recorded_at', 'desc'));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const d = snap.docs[0];
      return { id: d.id, ...d.data() };
    } catch (e) {
      console.warn('Firestore offline fallback for Vital Stats:', e);
      return null;
    }
  }, [user?.id, userCol]);

  const saveVitalStats = useCallback(async (vitalData: any) => {
    if (!user || !hasFirebaseConfig) return;
    try {
      const id = new Date().toISOString();
      const ref = doc(db, 'users', user.id, 'vital_stats', id);
      await setDoc(ref, {
        user_id: user.id,
        ...vitalData,
        recorded_at: id,
        created_at: id,
      });
    } catch (e) {
      console.warn('Firestore offline save fallback for Vital Stats:', e);
    }
  }, [user?.id]);

  // ---- BMI Records ----
  const getBMIHistory = useCallback(async (limit: number = 10) => {
    if (!user || !hasFirebaseConfig) return [];
    try {
      const col = userCol('bmi_records');
      if (!col) return [];
      const q = query(col, orderBy('recorded_at', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.slice(0, limit).map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Firestore offline fallback for BMI History:', e);
      return [];
    }
  }, [user?.id, userCol]);

  const saveBMIRecord = useCallback(async (bmiData: any) => {
    if (!user || !hasFirebaseConfig) return;
    try {
      const id = new Date().toISOString();
      const ref = doc(db, 'users', user.id, 'bmi_records', id);
      await setDoc(ref, {
        user_id: user.id,
        ...bmiData,
        recorded_at: id,
        created_at: id,
      });
    } catch (e) {
      console.warn('Firestore offline save fallback for BMI Record:', e);
    }
  }, [user?.id]);

  // ---- Medications ----
  const getMedications = useCallback(async () => {
    if (!user || !hasFirebaseConfig) return [];
    try {
      const col = userCol('medications');
      if (!col) return [];
      const q = query(col, where('is_active', '==', true), orderBy('created_at', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Firestore offline fallback for Medications list:', e);
      return [];
    }
  }, [user?.id, userCol]);

  const addMedication = useCallback(async (medicationData: any) => {
    if (!user || !hasFirebaseConfig) return;
    try {
      const id = 'med-' + Date.now();
      const ref = doc(db, 'users', user.id, 'medications', id);
      await setDoc(ref, {
        user_id: user.id,
        ...medicationData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore offline save fallback for Medication:', e);
    }
  }, [user?.id]);

  const deleteMedication = useCallback(async (medicationId: string) => {
    if (!user || !hasFirebaseConfig) return;
    try {
      const ref = doc(db, 'users', user.id, 'medications', medicationId);
      await setDoc(ref, { is_active: false, updated_at: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Firestore offline delete fallback for Medication:', e);
    }
  }, [user?.id]);

  const getMedicationLogs = useCallback(async (date: string = new Date().toISOString().split('T')[0]) => {
    if (!user || !hasFirebaseConfig) return [];
    try {
      const col = userCol('medication_logs');
      if (!col) return [];
      const q = query(col, where('date', '==', date));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Firestore offline fallback for Medication Logs:', e);
      return [];
    }
  }, [user?.id, userCol]);

  const logMedicationTaken = useCallback(async (medicationId: string, date: string = new Date().toISOString().split('T')[0]) => {
    if (!user || !hasFirebaseConfig) return;
    try {
      const id = `${medicationId}_${date}`;
      const ref = doc(db, 'users', user.id, 'medication_logs', id);
      await setDoc(ref, {
        medication_id: medicationId,
        user_id: user.id,
        date,
        taken_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore offline save fallback for Medication Log:', e);
    }
  }, [user?.id]);

  const removeMedicationLog = useCallback(async (medicationId: string, date: string = new Date().toISOString().split('T')[0]) => {
    if (!user || !hasFirebaseConfig) return;
    try {
      const id = `${medicationId}_${date}`;
      const ref = doc(db, 'users', user.id, 'medication_logs', id);
      await deleteDoc(ref);
    } catch (e) {
      console.warn('Firestore offline delete fallback for Medication Log:', e);
    }
  }, [user?.id]);

  return {
    loading: false,
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
  };
}