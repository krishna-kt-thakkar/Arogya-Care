import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Footprints, 
  Target, 
  Edit, 
  Check, 
  X, 
  Smartphone, 
  Watch, 
  MapPin,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useStreak } from '../../contexts/StreakContext';
import { useHealthData } from '../../hooks/useHealthData';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { supabase } from '../../lib/supabase';

const StepsTracker: React.FC = () => {
  const { addActivity } = useStreak();
  const { user } = useSupabaseAuth();
  const { getStepsTracking, updateStepsTracking, getWeeklyStepsTracking } = useHealthData();
  
  const [currentSteps, setCurrentSteps] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(10000);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState<'device' | 'gps' | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [showWeekly, setShowWeekly] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string>('');

  const today = new Date().toISOString().split('T')[0];
  const percentage = Math.min((currentSteps / dailyGoal) * 100, 100);
  const isGoalReached = currentSteps >= dailyGoal;

  // Load steps data
  useEffect(() => {
    const loadStepsData = async () => {
      // Check if Supabase is configured first
      if (!supabase) {
        setError('Database connection not configured. Using offline mode.');
        // Load from localStorage as fallback
        const savedData = localStorage.getItem('steps_tracker_data');
        if (savedData) {
          const data = JSON.parse(savedData);
          if (data.date === today) {
            setCurrentSteps(data.steps);
            setDailyGoal(data.goal);
            setLastUpdated(data.lastUpdated);
          }
        }
        return;
      }

      if (!user) return;
      
      try {
        setError(''); // Clear any previous errors
        const data = await getStepsTracking();
        if (data) {
          setCurrentSteps(data.steps);
          setDailyGoal(data.goal);
          setLastUpdated(data.updated_at);
        }
        
        const weeklyData = await getWeeklyStepsTracking();
        setWeeklyData(weeklyData);
      } catch (error) {
        console.error('Error loading steps data:', error);
        setError('Unable to sync with database. Using offline mode.');
        // Fallback to localStorage
        const savedData = localStorage.getItem('steps_tracker_data');
        if (savedData) {
          const data = JSON.parse(savedData);
          if (data.date === today) {
            setCurrentSteps(data.steps);
            setDailyGoal(data.goal);
            setLastUpdated(data.lastUpdated);
          }
        }
      }
    };

    loadStepsData();
  }, [user, getStepsTracking, getWeeklyStepsTracking, today]);

  // Save data
  const saveStepsData = async (steps: number, source: 'manual' | 'device' | 'gps' = 'manual') => {
    try {
      if (user && supabase) {
        await updateStepsTracking(steps, source);
        setError(''); // Clear error on successful save
      }
      
      // Always backup to localStorage
      const timestamp = new Date().toISOString();
      const data = {
        date: today,
        steps,
        goal: dailyGoal,
        source,
        lastUpdated: timestamp
      };
      localStorage.setItem('steps_tracker_data', JSON.stringify(data));
      setLastUpdated(timestamp);
      
      // Show save animation
      setShowSaveAnimation(true);
      setTimeout(() => setShowSaveAnimation(false), 2000);
      
      // Track activity for streak if goal reached
      if (steps >= dailyGoal && currentSteps < dailyGoal) {
        addActivity('steps_goal');
      }
    } catch (error) {
      console.error('Error saving steps data:', error);
      setError('Failed to sync with database. Data saved locally.');
      
      // Still save to localStorage as backup
      const timestamp = new Date().toISOString();
      const data = {
        date: today,
        steps,
        goal: dailyGoal,
        source,
        lastUpdated: timestamp
      };
      localStorage.setItem('steps_tracker_data', JSON.stringify(data));
      setLastUpdated(timestamp);
    }
  };

  // Simulate device detection
  const detectStepsFromDevice = async () => {
    setIsDetecting(true);
    setDetectionMethod('device');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSteps = Math.floor(Math.random() * 8000) + 2000;
    setCurrentSteps(mockSteps);
    await saveStepsData(mockSteps, 'device');
    setIsDetecting(false);
    setDetectionMethod(null);
  };

  // Simulate GPS-based step estimation
  const detectStepsFromGPS = async () => {
    setIsDetecting(true);
    setDetectionMethod('gps');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockSteps = Math.floor(Math.random() * 6000) + 3000;
    setCurrentSteps(mockSteps);
    await saveStepsData(mockSteps, 'gps');
    setIsDetecting(false);
    setDetectionMethod(null);
  };

  // Manual entry
  const handleManualEntry = async () => {
    const steps = parseInt(editValue);
    if (!isNaN(steps) && steps >= 0) {
      setCurrentSteps(steps);
      await saveStepsData(steps, 'manual');
      setIsEditing(false);
      setEditValue('');
    }
  };

  // Quick add steps
  const addQuickSteps = async (amount: number) => {
    const newSteps = currentSteps + amount;
    setCurrentSteps(newSteps);
    await saveStepsData(newSteps, 'manual');
  };

  const formatLastUpdated = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 shadow-lg border border-green-100 dark:border-green-800/30 transition-colors duration-300 cursor-pointer relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={() => setShowWeekly(!showWeekly)}
    >
      {/* Error Message */}
      {error && (
        <motion.div
          className="absolute top-2 left-2 right-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-2 mb-4 z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs text-yellow-700 dark:text-yellow-300">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Save Animation */}
      {showSaveAnimation && (
        <motion.div
          className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10"
          initial={{ opacity: 0, scale: 0, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: -10 }}
        >
          ✓ Saved
        </motion.div>
      )}

      {/* Header */}
      <div className={`flex items-center justify-between mb-4 ${error ? 'mt-12' : ''}`}>
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ 
              x: [0, 2, -2, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Footprints className="h-6 w-6 text-green-600 dark:text-green-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Steps Today</h3>
            {lastUpdated && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Updated {formatLastUpdated(lastUpdated)}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
              setEditValue(currentSteps.toString());
            }}
            className="p-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors"
          >
            <Edit className="h-4 w-4 text-green-600 dark:text-green-400" />
          </button>
        </div>
      </div>

      {/* Steps Display */}
      <div className="text-center mb-4">
        <motion.div
          className="relative mb-4"
          animate={isGoalReached ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1, repeat: isGoalReached ? Infinity : 0 }}
        >
          {/* Animated Walking Shoes */}
          <div className="relative mx-auto w-20 h-16 mb-4">
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                y: [0, -4, 0],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="text-4xl">👟</div>
            </motion.div>
            
            {/* Walking trail effect */}
            <motion.div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
              animate={{ 
                opacity: [0.3, 0.7, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="text-xs text-green-500">👣</div>
            </motion.div>
          </div>
        </motion.div>

        <motion.p 
          className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1"
          animate={isGoalReached ? { color: ['#059669', '#10b981', '#059669'] } : {}}
          transition={{ duration: 2, repeat: isGoalReached ? Infinity : 0 }}
        >
          {currentSteps.toLocaleString()}
        </motion.p>
        <p className="text-sm text-gray-600 dark:text-gray-300">of {dailyGoal.toLocaleString()} goal</p>
        
        {/* Progress Ring */}
        <div className="relative w-16 h-16 mx-auto mt-3">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-green-200 dark:text-green-800"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              className="text-green-500 dark:text-green-400"
              initial={{ strokeDasharray: "0 175.93" }}
              animate={{ strokeDasharray: `${(percentage / 100) * 175.93} 175.93` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-green-600 dark:text-green-400">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>

        {isGoalReached && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 text-green-600 dark:text-green-400 font-semibold text-sm"
          >
            🎉 Goal achieved!
          </motion.div>
        )}
      </div>

      {/* Detection Methods */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            detectStepsFromDevice();
          }}
          disabled={isDetecting}
          className="p-2 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 transition-all text-center disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Watch className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
          <span className="text-xs text-gray-600 dark:text-gray-300">Device</span>
        </motion.button>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            detectStepsFromGPS();
          }}
          disabled={isDetecting}
          className="p-2 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 transition-all text-center disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
          <span className="text-xs text-gray-600 dark:text-gray-300">GPS</span>
        </motion.button>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
            setEditValue(currentSteps.toString());
          }}
          className="p-2 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 transition-all text-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Edit className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
          <span className="text-xs text-gray-600 dark:text-gray-300">Manual</span>
        </motion.button>
      </div>

      {/* Detection Status */}
      <AnimatePresence>
        {isDetecting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700"
          >
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                {detectionMethod === 'device' ? (
                  <Watch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </motion.div>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {detectionMethod === 'device' 
                  ? 'Connecting to smartwatch...' 
                  : 'Tracking via GPS...'
                }
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {[1000, 2500, 5000].map((amount) => (
          <motion.button
            key={amount}
            onClick={(e) => {
              e.stopPropagation();
              addQuickSteps(amount);
            }}
            className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            +{amount}
          </motion.button>
        ))}
      </div>

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                📥 Enter Step Count
              </h3>
              
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center text-xl font-bold"
                placeholder="Enter steps"
                autoFocus
              />
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleManualEntry}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly View */}
      <AnimatePresence>
        {showWeekly && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWeekly(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-6">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Weekly Steps</h3>
              </div>

              <div className="space-y-3">
                {weeklyData.map((day, index) => (
                  <motion.div
                    key={day.date}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">
                        {day.steps.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round((day.steps / day.goal) * 100)}% of goal
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => setShowWeekly(false)}
                className="w-full mt-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StepsTracker;