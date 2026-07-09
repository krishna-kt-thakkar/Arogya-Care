import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Scale, TrendingUp, Target, Heart, Thermometer, Activity, Save, Clock, Settings, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/layout/Header';

interface VitalStat {
  id: string;
  label: string;
  value: string;
  unit: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  lastUpdated: string;
  inputType: 'number' | 'bp';
}

interface VitalStatus {
  status: 'Low' | 'Normal' | 'High' | 'Underweight' | 'Overweight' | 'Obese' | 'Fever';
  color: string;
  bgColor: string;
  message: string;
}

interface BMIData {
  weight: number;
  height: number;
  bmi: number;
  category: string;
  date: string;
}

// Define initial vital stats outside component to ensure stable reference
const initialVitalStats: VitalStat[] = [
  {
    id: 'bp',
    label: 'Blood Pressure',
    value: '120/80',
    unit: 'mmHg',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    lastUpdated: '',
    inputType: 'bp'
  },
  {
    id: 'heartRate',
    label: 'Heart Rate',
    value: '72',
    unit: 'bpm',
    icon: Activity,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    lastUpdated: '',
    inputType: 'number'
  },
  {
    id: 'temperature',
    label: 'Body Temperature',
    value: '98.6',
    unit: '°F',
    icon: Thermometer,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    lastUpdated: '',
    inputType: 'number'
  },
  {
    id: 'weight',
    label: 'Weight',
    value: '70',
    unit: 'kg',
    icon: Scale,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    lastUpdated: '',
    inputType: 'number'
  }
];

const BMIPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [bmi, setBMI] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bmiHistory, setBmiHistory] = useState<BMIData[]>([]);
  const [vitalStats, setVitalStats] = useState<VitalStat[]>(initialVitalStats);
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});

  // Load saved data on component mount
  useEffect(() => {
    const savedVitals = localStorage.getItem('bmi_vital_stats');
    const savedBMIHistory = localStorage.getItem('bmi_history');
    const savedSettings = localStorage.getItem('bmi_settings');
    
    if (savedVitals) {
      const data = JSON.parse(savedVitals);
      
      // Merge saved data with initial vital stats to restore icons
      const restoredVitals = initialVitalStats.map(initialStat => {
        const savedStat = data.vitals?.find((v: any) => v.id === initialStat.id);
        return {
          ...initialStat,
          value: savedStat?.value || initialStat.value,
          lastUpdated: savedStat?.lastUpdated || initialStat.lastUpdated
        };
      });
      
      setVitalStats(restoredVitals);
      setHeight(data.height || '170');
      setWeight(data.weight || '70');
      setUnit(data.unit || 'metric');
      if (data.bmi) setBMI(data.bmi);
    }
    
    if (savedBMIHistory) {
      setBmiHistory(JSON.parse(savedBMIHistory));
    }
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setUnit(settings.unit || 'metric');
    }
  }, []);

  // Save data to localStorage (excluding non-serializable icon property)
  const saveVitalData = (updatedVitals: VitalStat[], newHeight?: string, newWeight?: string, newBMI?: number) => {
    const timestamp = new Date().toISOString();
    
    // Create serializable version of vitals (without icon property)
    const serializableVitals = updatedVitals.map(({ icon, ...rest }) => rest);
    
    const data = {
      vitals: serializableVitals,
      height: newHeight || height,
      weight: newWeight || weight,
      bmi: newBMI || bmi,
      unit,
      lastUpdated: timestamp
    };
    
    localStorage.setItem('bmi_vital_stats', JSON.stringify(data));
    
    // Show save animation
    setShowSaveAnimation(true);
    setTimeout(() => setShowSaveAnimation(false), 2000);
  };

  const saveBMIHistory = (newHistory: BMIData[]) => {
    localStorage.setItem('bmi_history', JSON.stringify(newHistory));
    setBmiHistory(newHistory);
  };

  const saveSettings = () => {
    const settings = { unit };
    localStorage.setItem('bmi_settings', JSON.stringify(settings));
  };

  useEffect(() => {
    saveSettings();
  }, [unit]);

  // Status evaluation functions
  const getTemperatureStatus = (temp: number): VitalStatus => {
    if (temp < 97) return { 
      status: 'Low', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      message: 'Body temperature is below normal. Consider warming up and monitoring.'
    };
    if (temp <= 99) return { 
      status: 'Normal', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      message: 'Body temperature is within normal range. ✅'
    };
    if (temp <= 100.4) return { 
      status: 'Fever', 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      message: 'Slight fever detected. Stay hydrated and rest.'
    };
    return { 
      status: 'High', 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      message: 'High fever! Consider consulting a healthcare provider.'
    };
  };

  const getHeartRateStatus = (hr: number): VitalStatus => {
    if (hr < 60) return { 
      status: 'Low', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      message: 'Heart rate is below normal. Monitor and consult if persistent.'
    };
    if (hr <= 100) return { 
      status: 'Normal', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      message: 'Heart rate is within normal range. ✅'
    };
    return { 
      status: 'High', 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      message: 'Elevated heart rate. Consider rest and relaxation.'
    };
  };

  const getBloodPressureStatus = (systolic: number, diastolic: number): VitalStatus => {
    if (systolic < 90 || diastolic < 60) return { 
      status: 'Low', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      message: 'Blood pressure is low. Stay hydrated and monitor symptoms.'
    };
    if (systolic <= 120 && diastolic <= 80) return { 
      status: 'Normal', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      message: 'Blood pressure is optimal. Keep up the healthy lifestyle! ✅'
    };
    if (systolic <= 139 || diastolic <= 89) return { 
      status: 'High', 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      message: 'Blood pressure is elevated. Consider reducing salt and stress.'
    };
    return { 
      status: 'High', 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      message: 'High blood pressure detected. Consult healthcare provider.'
    };
  };

  const getBMIStatus = (bmi: number): VitalStatus => {
    if (bmi < 18.5) return { 
      status: 'Underweight', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      message: 'Consider gaining weight through healthy nutrition and exercise.'
    };
    if (bmi <= 24.9) return { 
      status: 'Normal', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      message: 'Weight is in healthy range. Maintain your current lifestyle! ✅'
    };
    if (bmi <= 29.9) return { 
      status: 'Overweight', 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      message: 'Consider losing weight through balanced diet and exercise.'
    };
    return { 
      status: 'Obese', 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      message: 'Consult healthcare provider for weight management plan.'
    };
  };

  const getVitalStatus = (stat: VitalStat): VitalStatus => {
    switch (stat.id) {
      case 'temperature':
        return getTemperatureStatus(parseFloat(stat.value));
      case 'heartRate':
        return getHeartRateStatus(parseInt(stat.value));
      case 'bp':
        const [systolic, diastolic] = stat.value.split('/').map(v => parseInt(v));
        return getBloodPressureStatus(systolic, diastolic);
      case 'weight':
        if (height && stat.value) {
          const heightInMeters = parseFloat(height) / 100;
          const weightInKg = parseFloat(stat.value);
          const calculatedBMI = weightInKg / (heightInMeters * heightInMeters);
          return getBMIStatus(calculatedBMI);
        }
        return { status: 'Normal', color: 'text-green-600', bgColor: 'bg-green-100', message: 'Weight recorded.' };
      default:
        return { status: 'Normal', color: 'text-green-600', bgColor: 'bg-green-100', message: 'Value recorded.' };
    }
  };

  const calculateBMI = () => {
    if (height && weight) {
      let heightInMeters: number;
      let weightInKg: number;
      
      if (unit === 'metric') {
        heightInMeters = parseFloat(height) / 100;
        weightInKg = parseFloat(weight);
      } else {
        // Convert feet+inches to meters, pounds to kg
        heightInMeters = parseFloat(height) * 0.0254; // inches to meters
        weightInKg = parseFloat(weight) * 0.453592; // pounds to kg
      }
      
      const calculatedBMI = weightInKg / (heightInMeters * heightInMeters);
      setBMI(calculatedBMI);
      
      // Update weight in vital stats
      const updatedVitals = vitalStats.map(stat => 
        stat.id === 'weight' 
          ? { ...stat, value: weight, lastUpdated: new Date().toISOString() }
          : stat
      );
      setVitalStats(updatedVitals);
      saveVitalData(updatedVitals, height, weight, calculatedBMI);
      
      return calculatedBMI;
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { category: 'Obese', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      // Initialize edit values with current values
      const initialValues: {[key: string]: string} = {};
      vitalStats.forEach(stat => {
        initialValues[stat.id] = stat.value;
      });
      setEditValues(initialValues);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update vital stats with new values
    const timestamp = new Date().toISOString();
    const updatedStats = vitalStats.map(stat => ({
      ...stat,
      value: editValues[stat.id] || stat.value,
      lastUpdated: timestamp
    }));
    
    setVitalStats(updatedStats);
    
    // Update weight for BMI calculation if changed
    if (editValues.weight) {
      setWeight(editValues.weight);
    }
    
    saveVitalData(updatedStats, height, editValues.weight || weight);
    
    setIsEditing(false);
    setIsSaving(false);
    setEditValues({});
  };

  const handleInputChange = (id: string, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const saveBMIRecord = () => {
    const currentBMI = calculateBMI();
    if (currentBMI) {
      const newRecord: BMIData = {
        weight: parseFloat(weight),
        height: parseFloat(height),
        bmi: currentBMI,
        category: getBMICategory(currentBMI).category,
        date: new Date().toISOString().split('T')[0]
      };
      
      const updatedHistory = [newRecord, ...bmiHistory.slice(0, 9)];
      saveBMIHistory(updatedHistory);
    }
  };

  const resetAllData = () => {
    if (confirm('Are you sure you want to reset all vital stats data? This action cannot be undone.')) {
      localStorage.removeItem('bmi_vital_stats');
      localStorage.removeItem('bmi_history');
      localStorage.removeItem('bmi_settings');
      
      // Reset to default values
      setHeight('170');
      setWeight('70');
      setBMI(null);
      setVitalStats(initialVitalStats.map(stat => ({ ...stat, value: '', lastUpdated: '' })));
      setBmiHistory([]);
      setUnit('metric');
      
      setShowSaveAnimation(true);
      setTimeout(() => setShowSaveAnimation(false), 2000);
    }
  };

  const renderInput = (stat: VitalStat) => {
    const currentValue = editValues[stat.id] || stat.value;
    
    if (stat.inputType === 'bp') {
      const [systolic, diastolic] = currentValue.split('/');
      return (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={systolic}
            onChange={(e) => handleInputChange(stat.id, `${e.target.value}/${diastolic}`)}
            className="w-20 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="120"
          />
          <span className="text-gray-500 dark:text-gray-400 font-medium">/</span>
          <input
            type="number"
            value={diastolic}
            onChange={(e) => handleInputChange(stat.id, `${systolic}/${e.target.value}`)}
            className="w-20 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="80"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">{stat.unit}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={currentValue}
          onChange={(e) => handleInputChange(stat.id, e.target.value)}
          className="w-24 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder={stat.value}
          step={stat.id === 'temperature' ? '0.1' : '1'}
        />
        <span className="text-sm text-gray-600 dark:text-gray-300">{stat.unit}</span>
      </div>
    );
  };

  const formatLastUpdated = (timestamp: string) => {
    if (!timestamp) return 'Never updated';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Save Animation */}
        {showSaveAnimation && (
          <motion.div
            className="fixed top-4 right-4 bg-teal-500 text-white px-4 py-2 rounded-xl shadow-lg z-50"
            initial={{ opacity: 0, scale: 0, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0, x: 100 }}
          >
            ✓ Vitals Updated & Saved
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('bmiVitalStats')}</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Track and update your health metrics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
            
            <motion.button
              onClick={handleEditToggle}
              className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all flex items-center space-x-2 ${
                isEditing 
                  ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                  : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-xl'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{isEditing ? 'Cancel' : 'Update Stats'}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="mb-8 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Settings</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Unit System</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Choose between metric and imperial units</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setUnit('metric')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      unit === 'metric'
                        ? 'bg-white dark:bg-gray-600 text-teal-600 dark:text-teal-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Metric
                  </button>
                  <button
                    onClick={() => setUnit('imperial')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      unit === 'imperial'
                        ? 'bg-white dark:bg-gray-600 text-teal-600 dark:text-teal-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Imperial
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Reset All Data</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Clear all vital stats and BMI history</p>
                </div>
                <motion.button
                  onClick={resetAllData}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BMI Calculator */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center mb-6">
              <Scale className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">BMI Calculator</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Height ({unit === 'metric' ? 'cm' : 'inches'})
                </label>
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  >
                    📏
                  </motion.div>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={`Enter height in ${unit === 'metric' ? 'cm' : 'inches'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weight ({unit === 'metric' ? 'kg' : 'lbs'})
                </label>
                <div className="relative">
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  >
                    ⚖️
                  </motion.div>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={`Enter weight in ${unit === 'metric' ? 'kg' : 'lbs'}`}
                  />
                </div>
              </div>

              <motion.button
                onClick={calculateBMI}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Calculate BMI
              </motion.button>

              {bmi && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-6 rounded-2xl ${getBMICategory(bmi).bg} border ${getBMICategory(bmi).border}`}
                >
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your BMI</p>
                    <p className={`text-4xl font-bold ${getBMICategory(bmi).color} mb-2`}>
                      {bmi.toFixed(1)}
                    </p>
                    <p className={`text-lg font-semibold ${getBMICategory(bmi).color} mb-3`}>
                      {getBMICategory(bmi).category}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getBMIStatus(bmi).message}
                    </p>
                  </div>
                  
                  <motion.button
                    onClick={saveBMIRecord}
                    className="w-full mt-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save className="h-4 w-4" />
                    <span>Save BMI Record</span>
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Vital Stats Update */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Vital Statistics</h2>
              </div>
              {isEditing && (
                <motion.button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </motion.button>
              )}
            </div>

            <div className="space-y-6">
              {vitalStats.map((stat, index) => {
                const status = getVitalStatus(stat);
                return (
                  <motion.div
                    key={stat.id}
                    className={`p-6 rounded-2xl ${stat.bgColor} dark:bg-opacity-20 border border-gray-100 dark:border-gray-600`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-full bg-white dark:bg-gray-700 shadow-sm mr-4`}>
                          <motion.div
                            animate={stat.id === 'heartRate' ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                          </motion.div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">{stat.label}</h3>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Updated {formatLastUpdated(stat.lastUpdated)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {isEditing ? (
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Enter new value:
                          </label>
                          {renderInput(stat)}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className={`text-3xl font-bold ${stat.color} mr-2`}>
                            {stat.value}
                          </span>
                          <span className="text-lg text-gray-600 dark:text-gray-400">{stat.unit}</span>
                        </div>
                      )}
                      
                      {!isEditing && (
                        <motion.div 
                          className={`flex items-center px-3 py-2 rounded-full ${status.bgColor} dark:bg-opacity-30`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            status.status === 'Normal' ? 'bg-green-500' :
                            status.status === 'Low' ? 'bg-blue-500' :
                            status.status === 'High' || status.status === 'Fever' ? 'bg-red-500' :
                            status.status === 'Underweight' ? 'bg-blue-500' :
                            status.status === 'Overweight' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}></div>
                          <span className={`text-sm font-semibold ${status.color}`}>
                            {status.status}
                          </span>
                        </motion.div>
                      )}
                    </div>
                    
                    {!isEditing && (
                      <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-xl">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          💡 {status.message}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* BMI Categories Reference & History */}
        <motion.div
          className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* BMI Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <Target className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">BMI Categories</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { range: '< 18.5', category: 'Underweight', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-700' },
                { range: '18.5 - 24.9', category: 'Normal BMI', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', border: 'border-green-200 dark:border-green-700' },
                { range: '25 - 29.9', category: 'Overweight', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-700' },
                { range: '≥ 30', category: 'Obese', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', border: 'border-red-200 dark:border-red-700' }
              ].map((item, index) => (
                <motion.div
                  key={item.category}
                  className={`p-4 rounded-2xl ${item.color} border ${item.border} text-center`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <p className="font-bold text-xl mb-2">{item.range}</p>
                  <p className="font-semibold text-sm">{item.category}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* BMI History */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <Clock className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">BMI History</h2>
            </div>

            {bmiHistory.length > 0 ? (
              <div className="space-y-3">
                {bmiHistory.slice(0, 5).map((entry, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div>
                      <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">{entry.bmi.toFixed(1)}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{entry.date}</div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getBMICategory(entry.bmi).color} ${getBMICategory(entry.bmi).bg}`}>
                        {entry.category}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {entry.weight}kg, {entry.height}cm
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No BMI records yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Calculate and save your first BMI</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Saving animation overlay */}
        {isSaving && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <motion.div
                className="mb-4"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Heart className="h-12 w-12 text-teal-600 dark:text-teal-400 mx-auto" />
              </motion.div>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">Saving your vital stats...</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Your health data is being securely stored ✨</p>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default BMIPage;