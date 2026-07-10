import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, 
  Sun, 
  Clock, 
  Edit, 
  Check, 
  X, 
  Smartphone, 
  Watch, 
  Calendar,
  TrendingUp,
  Star,
  Coffee,
  Frown,
  Meh,
  Smile
} from 'lucide-react';
import { useStreak } from '../../contexts/StreakContext';

interface SleepData {
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number; // in hours
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
  source: 'manual' | 'device' | 'auto';
  lastUpdated: string;
}

const SleepTracker: React.FC = () => {
  const { addActivity } = useStreak();
  const [sleepDuration, setSleepDuration] = useState(0);
  const [bedTime, setBedTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [sleepQuality, setSleepQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
  const [sleepNotes, setSleepNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState<'device' | 'auto' | null>(null);
  const [weeklyData, setWeeklyData] = useState<SleepData[]>([]);
  const [showWeekly, setShowWeekly] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const today = new Date().toISOString().split('T')[0];
  const optimalSleep = 8; // hours
  const sleepPercentage = Math.min((sleepDuration / optimalSleep) * 100, 100);
  const isGoodSleep = sleepDuration >= 7 && sleepDuration <= 9;

  // Load saved data
  useEffect(() => {
    const savedData = localStorage.getItem('sleep_tracker_data');
    const savedWeeklyData = localStorage.getItem('sleep_tracker_weekly');
    
    if (savedData) {
      const data = JSON.parse(savedData);
      // Check if data is from today
      if (data.date === today) {
        setSleepDuration(data.duration);
        setBedTime(data.bedTime);
        setWakeTime(data.wakeTime);
        setSleepQuality(data.quality);
        setSleepNotes(data.notes || '');
        setLastUpdated(data.lastUpdated);
      } else {
        // New day, reset data
        const newData = {
          date: today,
          bedTime: '22:00',
          wakeTime: '06:00',
          duration: 0,
          quality: 'good' as const,
          notes: '',
          source: 'manual' as const,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('sleep_tracker_data', JSON.stringify(newData));
        setSleepDuration(0);
        setBedTime('22:00');
        setWakeTime('06:00');
        setSleepQuality('good');
        setSleepNotes('');
        setLastUpdated(newData.lastUpdated);
      }
    } else {
      // Initialize data
      const newData = {
        date: today,
        bedTime: '22:00',
        wakeTime: '06:00',
        duration: 0,
        quality: 'good' as const,
        notes: '',
        source: 'manual' as const,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('sleep_tracker_data', JSON.stringify(newData));
      setLastUpdated(newData.lastUpdated);
    }

    // Load weekly data
    if (savedWeeklyData) {
      setWeeklyData(JSON.parse(savedWeeklyData));
    } else {
      // Initialize with mock weekly data
      const mockWeeklyData = [
        { date: getDateString(-6), bedTime: '22:30', wakeTime: '06:30', duration: 8.0, quality: 'good' as const, notes: '', source: 'device' as const, lastUpdated: new Date().toISOString() },
        { date: getDateString(-5), bedTime: '23:00', wakeTime: '07:00', duration: 8.0, quality: 'excellent' as const, notes: '', source: 'device' as const, lastUpdated: new Date().toISOString() },
        { date: getDateString(-4), bedTime: '22:15', wakeTime: '06:15', duration: 8.0, quality: 'good' as const, notes: '', source: 'auto' as const, lastUpdated: new Date().toISOString() },
        { date: getDateString(-3), bedTime: '23:30', wakeTime: '06:45', duration: 7.3, quality: 'fair' as const, notes: '', source: 'manual' as const, lastUpdated: new Date().toISOString() },
        { date: getDateString(-2), bedTime: '22:00', wakeTime: '06:30', duration: 8.5, quality: 'excellent' as const, notes: '', source: 'device' as const, lastUpdated: new Date().toISOString() },
        { date: getDateString(-1), bedTime: '22:45', wakeTime: '07:15', duration: 8.5, quality: 'good' as const, notes: '', source: 'device' as const, lastUpdated: new Date().toISOString() },
        { date: today, bedTime: bedTime, wakeTime: wakeTime, duration: sleepDuration, quality: sleepQuality, notes: sleepNotes, source: 'manual' as const, lastUpdated: new Date().toISOString() }
      ];
      localStorage.setItem('sleep_tracker_weekly', JSON.stringify(mockWeeklyData));
      setWeeklyData(mockWeeklyData);
    }
  }, [today]);

  const getDateString = (daysOffset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  };

  // Calculate sleep duration from times
  const calculateDuration = (bedTime: string, wakeTime: string): number => {
    const bed = new Date(`2000-01-01T${bedTime}:00`);
    let wake = new Date(`2000-01-01T${wakeTime}:00`);
    
    // If wake time is earlier than bed time, assume next day
    if (wake <= bed) {
      wake = new Date(`2000-01-02T${wakeTime}:00`);
    }
    
    const diffMs = wake.getTime() - bed.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10; // Round to 1 decimal
  };

  // Save sleep data
  const saveSleepData = (data: Partial<SleepData>, source: 'manual' | 'device' | 'auto' = 'manual') => {
    const timestamp = new Date().toISOString();
    const duration = data.duration || calculateDuration(data.bedTime || bedTime, data.wakeTime || wakeTime);
    
    const newEntry: SleepData = {
      date: today,
      bedTime: data.bedTime || bedTime,
      wakeTime: data.wakeTime || wakeTime,
      duration,
      quality: data.quality || sleepQuality,
      notes: data.notes || sleepNotes,
      source,
      lastUpdated: timestamp
    };

    localStorage.setItem('sleep_tracker_data', JSON.stringify(newEntry));
    setLastUpdated(timestamp);
    
    // Update weekly data
    const updatedWeeklyData = weeklyData.map(day => 
      day.date === today 
        ? { ...day, ...newEntry }
        : day
    );
    localStorage.setItem('sleep_tracker_weekly', JSON.stringify(updatedWeeklyData));
    setWeeklyData(updatedWeeklyData);
    
    // Show save animation
    setShowSaveAnimation(true);
    setTimeout(() => setShowSaveAnimation(false), 2000);
    
    // Track activity for streak if good sleep
    if (duration >= 7 && sleepDuration < 7) {
      addActivity('good_sleep');
    }
  };

  // Auto-detect sleep from screen time
  const detectSleepFromDevice = async () => {
    setIsDetecting(true);
    setDetectionMethod('device');
    
    // Simulate device connection and sleep data retrieval
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Mock sleep data from smartwatch
    const mockBedTime = `${22 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
    const mockWakeTime = `${6 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
    const mockDuration = calculateDuration(mockBedTime, mockWakeTime);
    
    setBedTime(mockBedTime);
    setWakeTime(mockWakeTime);
    setSleepDuration(mockDuration);
    
    saveSleepData({
      bedTime: mockBedTime,
      wakeTime: mockWakeTime,
      duration: mockDuration
    }, 'device');
    
    setIsDetecting(false);
    setDetectionMethod(null);
  };

  // Auto-detect from phone usage patterns
  const detectSleepFromAuto = async () => {
    setIsDetecting(true);
    setDetectionMethod('auto');
    
    // Simulate screen time analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock auto-detection based on phone usage
    const lastNightBed = `${23 + Math.floor(Math.random() * 1)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
    const thisMorningWake = `${6 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
    const autoDuration = calculateDuration(lastNightBed, thisMorningWake);
    
    setBedTime(lastNightBed);
    setWakeTime(thisMorningWake);
    setSleepDuration(autoDuration);
    
    saveSleepData({
      bedTime: lastNightBed,
      wakeTime: thisMorningWake,
      duration: autoDuration
    }, 'auto');
    
    setIsDetecting(false);
    setDetectionMethod(null);
  };

  // Manual entry
  const handleManualEntry = () => {
    const duration = calculateDuration(bedTime, wakeTime);
    setSleepDuration(duration);
    saveSleepData({
      bedTime,
      wakeTime,
      duration,
      quality: sleepQuality,
      notes: sleepNotes
    }, 'manual');
    setIsEditing(false);
  };

  // Get sleep quality color
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'fair': return 'text-yellow-600 dark:text-yellow-400';
      case 'poor': return 'text-red-600 dark:text-red-400';
      default: return 'text-secondary-custom';
    }
  };

  // Get sleep status message
  const getSleepStatus = () => {
    if (sleepDuration === 0) return 'No sleep logged yet';
    if (sleepDuration < 6) return 'Try to get more rest tonight';
    if (sleepDuration >= 7 && sleepDuration <= 9) return 'Great sleep!';
    if (sleepDuration > 9) return 'Well rested!';
    return 'Could use more sleep';
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
      className="glass-card p-6 border border-card-custom cursor-pointer relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={() => setShowWeekly(!showWeekly)}
    >
      {/* Save Animation */}
      {showSaveAnimation && (
        <motion.div
          className="absolute top-2 right-2 bg-indigo-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10"
          initial={{ opacity: 0, scale: 0, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: -10 }}
        >
          Saved
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Moon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-primary-custom">Sleep Hours</h3>
            {lastUpdated && (
              <p className="text-xs text-secondary-custom">
                Updated {formatLastUpdated(lastUpdated)}
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="p-1 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800/30 transition-colors"
        >
          <Edit className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </button>
      </div>

      {/* Sleep Display */}
      <div className="text-center mb-4">
        <motion.div
          className="relative mb-4"
          animate={isGoodSleep ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: isGoodSleep ? Infinity : 0 }}
        >
          {/* Animated Sleeping Person */}
          <div className="relative mx-auto w-20 h-16 mb-4">
            <motion.div
              className="absolute inset-0 flex items-center justify-center icon-3d-box"
              animate={{ 
                y: [0, -5, 0],
                rotateY: [0, 8, -8, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Layer 3: Deep background blur glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 blur-lg opacity-50 scale-110" />
              {/* Layer 2: Mid shadow for depth */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-60 translate-y-1 blur-sm" />
              {/* Layer 1: Main glossy face */}
              <div className="relative z-10 p-3.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg border border-white/20">
                <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-xl bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
                <Moon className="h-8 w-8 text-white relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
              </div>
            </motion.div>
            
            {/* ZZZ animation */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ 
                opacity: [0, 1, 0],
                y: [0, -8, -16],
                x: [0, 4, 8]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeOut"
              }}
            >
              <Moon className="h-5 w-5 text-indigo-500" />
            </motion.div>
          </div>
        </motion.div>

        <motion.p 
          className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1"
          animate={isGoodSleep ? { color: ['#4f46e5', '#6366f1', '#4f46e5'] } : {}}
          transition={{ duration: 2, repeat: isGoodSleep ? Infinity : 0 }}
        >
          {sleepDuration > 0 ? `${sleepDuration}h` : '--'}
        </motion.p>
        <p className="text-sm text-secondary-custom">
          {getSleepStatus()}
        </p>
        
        {/* Sleep Quality Indicator */}
        {sleepDuration > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-center space-x-1 mb-2">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < ['poor', 'fair', 'good', 'excellent'].indexOf(sleepQuality) + 1
                      ? 'bg-indigo-500 dark:bg-indigo-400'
                      : 'bg-white/20'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </div>
            <p className={`text-xs font-medium ${getQualityColor(sleepQuality)}`}>
              {sleepQuality.charAt(0).toUpperCase() + sleepQuality.slice(1)} Sleep
            </p>
          </div>
        )}

        {/* Sleep Times */}
        {sleepDuration > 0 && (
          <div className="flex items-center justify-center space-x-4 mt-3 text-xs text-secondary-custom">
            <div className="flex items-center space-x-1">
              <Moon className="h-3 w-3" />
              <span>{bedTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sun className="h-3 w-3" />
              <span>{wakeTime}</span>
            </div>
          </div>
        )}

        {isGoodSleep && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm"
          >
            Well rested!
          </motion.div>
        )}
      </div>

      {/* Detection Methods */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            detectSleepFromDevice();
          }}
          disabled={isDetecting}
          className="p-2 bg-card-surface rounded-xl border border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all text-center disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Watch className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
          <span className="text-xs text-secondary-custom">Device</span>
        </motion.button>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            detectSleepFromAuto();
          }}
          disabled={isDetecting}
          className="p-2 bg-card-surface rounded-xl border border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all text-center disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Smartphone className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
          <span className="text-xs text-secondary-custom">Auto</span>
        </motion.button>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="p-2 bg-card-surface rounded-xl border border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all text-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Edit className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
          <span className="text-xs text-secondary-custom">Manual</span>
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
                  <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </motion.div>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {detectionMethod === 'device' 
                  ? 'Reading sleep data from device...' 
                  : 'Analyzing screen time patterns...'
                }
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Button */}
      {sleepNotes && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setShowNotes(true);
          }}
          className="w-full p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Sleep Notes
        </motion.button>
      )}

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
              className="bg-card-surface rounded-3xl p-6 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-primary-custom mb-6">
                Log Sleep Hours
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-custom mb-2">
                      Bed Time
                    </label>
                    <div className="relative">
                      <Moon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-custom" />
                      <input
                        type="time"
                        value={bedTime}
                        onChange={(e) => setBedTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent bg-card-surface text-primary-custom"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-custom mb-2">
                      Wake Time
                    </label>
                    <div className="relative">
                      <Sun className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-custom" />
                      <input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent bg-card-surface text-primary-custom"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-custom mb-2">
                    Sleep Quality
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'poor', icon: Frown, label: 'Poor', color: 'text-red-500' },
                      { value: 'fair', icon: Meh, label: 'Fair', color: 'text-amber-500' },
                      { value: 'good', icon: Smile, label: 'Good', color: 'text-indigo-500' },
                      { value: 'excellent', icon: Star, label: 'Great', color: 'text-emerald-500' }
                    ].map((quality) => {
                      const IconComponent = quality.icon;
                      return (
                        <button
                          key={quality.value}
                          type="button"
                          onClick={() => setSleepQuality(quality.value as any)}
                          className={`p-3 rounded-xl border transition-all ${
                            sleepQuality === quality.value
                              ? 'border-indigo-500 bg-indigo-500/10'
                              : 'border-card-custom hover:border-indigo-300/40 bg-card-surface/40'
                          }`}
                        >
                          <div className="text-center flex flex-col items-center">
                            <IconComponent className={`h-5 w-5 mb-1.5 ${quality.color}`} />
                            <p className="text-xs font-semibold text-primary-custom">
                              {quality.label}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-custom mb-2">
                    Sleep Notes (Optional)
                  </label>
                  <textarea
                    value={sleepNotes}
                    onChange={(e) => setSleepNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent bg-card-surface text-primary-custom resize-none"
                    rows={3}
                    placeholder="Had vivid dreams / Slept badly / Woke up refreshed..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 border border-card-custom text-secondary-custom rounded-xl font-semibold hover:bg-white/5 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleManualEntry}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Save Sleep</span>
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
              className="bg-card-surface rounded-3xl p-8 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-6">
                <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3" />
                <h3 className="text-xl font-bold text-primary-custom">Weekly Sleep</h3>
              </div>

              <div className="space-y-3">
                {weeklyData.map((day, index) => (
                  <motion.div
                    key={day.date}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-secondary-custom" />
                      <span className="font-medium text-primary-custom">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600 dark:text-indigo-400">
                        {day.duration}h
                      </p>
                      <p className={`text-xs ${getQualityColor(day.quality)}`}>
                        {day.quality}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => setShowWeekly(false)}
                className="w-full mt-6 py-3 bg-white/10 text-primary-custom rounded-xl font-semibold hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleep Notes Modal */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNotes(false)}
          >
            <motion.div
              className="bg-card-surface rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-primary-custom mb-4">
                Sleep Notes
              </h3>
              
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                <p className="text-secondary-custom leading-relaxed">
                  {sleepNotes}
                </p>
              </div>
              
              <button
                onClick={() => setShowNotes(false)}
                className="w-full mt-4 py-3 bg-white/10 text-primary-custom rounded-xl font-semibold hover:bg-white/20 transition-colors"
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

export default SleepTracker;