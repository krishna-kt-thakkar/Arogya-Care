import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  CheckCircle, 
  Circle, 
  Edit, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  Target, 
  Sparkles, 
  Clock, 
  Bell, 
  BellOff,
  BarChart3,
  Flame,
  Award,
  Settings,
  Lightbulb,
  Brain,
  Zap,
  Heart,
  Users,
  Shield,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useStreak } from '../contexts/StreakContext';
import Header from '../components/layout/Header';

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'discipline': return Shield;
    case 'productivity': return Zap;
    case 'screen-time': case 'digital wellness': case 'reduce screen time': return Eye;
    case 'relationships': return Users;
    case 'self-care': return Heart;
    case 'confidence': case 'confidence building': return Award;
    case 'mindfulness': return Brain;
    default: return Target;
  }
};

interface Habit {
  id: string;
  title: string;
  emoji: string;
  frequency: 'daily' | 'custom';
  customDays?: string[];
  reminderTime?: string;
  reminderEnabled: boolean;
  streak: number;
  longestStreak: number;
  completedDates: string[];
  createdDate: string;
  category: string;
  description?: string;
  lastUpdated: string;
}

interface HabitSuggestion {
  title: string;
  emoji: string;
  description: string;
  category: string;
}

interface HabitData {
  habits: Habit[];
  lastUpdated: string;
}

const HabitTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addActivity } = useStreak();
  
  // State management
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'today' | 'analytics' | 'calendar'>('today');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);

  // New habit form
  const [newHabit, setNewHabit] = useState({
    title: '',
    emoji: 'bg-purple-500',
    frequency: 'daily' as 'daily' | 'custom',
    customDays: [] as string[],
    reminderTime: '09:00',
    reminderEnabled: true,
    category: 'Personal Growth',
    description: ''
  });

  // Goal categories for suggestions
  const goalCategories = [
    { id: 'discipline', label: 'Build Discipline', icon: Shield, color: 'text-red-600' },
    { id: 'productivity', label: 'Improve Productivity', icon: Zap, color: 'text-blue-600' },
    { id: 'screen-time', label: 'Reduce Screen Time', icon: Eye, color: 'text-purple-600' },
    { id: 'relationships', label: 'Improve Relationships', icon: Users, color: 'text-pink-600' },
    { id: 'self-care', label: 'Self-Care', icon: Heart, color: 'text-green-600' },
    { id: 'confidence', label: 'Confidence Building', icon: Award, color: 'text-yellow-600' },
    { id: 'mindfulness', label: 'Mindfulness', icon: Brain, color: 'text-indigo-600' }
  ];

  // GPT-powered habit suggestions based on goals
  const habitSuggestions: { [key: string]: HabitSuggestion[] } = {
    discipline: [
      { title: 'Make bed immediately after waking', emoji: 'bg-red-500', description: 'Start your day with a small win', category: 'Discipline' },
      { title: 'No phone for first 30 minutes', emoji: 'bg-red-500', description: 'Begin day mindfully without distractions', category: 'Discipline' },
      { title: 'Cold shower for 2 minutes', emoji: 'bg-red-500', description: 'Build mental toughness daily', category: 'Discipline' },
      { title: 'Complete one difficult task first', emoji: 'bg-red-500', description: 'Tackle your biggest challenge early', category: 'Discipline' }
    ],
    productivity: [
      { title: 'Write 3 priorities for tomorrow', emoji: 'bg-blue-500', description: 'Plan ahead for focused days', category: 'Productivity' },
      { title: 'Time-block calendar for next day', emoji: 'bg-blue-500', description: 'Structure your time intentionally', category: 'Productivity' },
      { title: 'Clear desk before leaving', emoji: 'bg-blue-500', description: 'Organized space, organized mind', category: 'Productivity' },
      { title: 'Review and close all browser tabs', emoji: 'bg-blue-500', description: 'Digital declutter for focus', category: 'Productivity' }
    ],
    'screen-time': [
      { title: 'No social media after 10 PM', emoji: 'bg-purple-500', description: 'Protect your evening peace', category: 'Digital Wellness' },
      { title: 'Phone in another room while working', emoji: 'bg-purple-500', description: 'Remove temptation, boost focus', category: 'Digital Wellness' },
      { title: 'Read physical book for 15 minutes', emoji: 'bg-purple-500', description: 'Replace scrolling with learning', category: 'Digital Wellness' },
      { title: 'Take hourly 5-minute screen breaks', emoji: 'bg-purple-500', description: 'Rest your eyes and mind', category: 'Digital Wellness' }
    ],
    relationships: [
      { title: 'Compliment one person genuinely', emoji: 'bg-pink-500', description: 'Spread positivity and connection', category: 'Relationships' },
      { title: 'Call family member for 10 minutes', emoji: 'bg-pink-500', description: 'Strengthen family bonds', category: 'Relationships' },
      { title: 'Send appreciation message to someone', emoji: 'bg-pink-500', description: 'Express gratitude to others', category: 'Relationships' },
      { title: 'Listen without interrupting in conversations', emoji: 'bg-pink-500', description: 'Practice active listening', category: 'Relationships' }
    ],
    'self-care': [
      { title: 'Apply skincare routine mindfully', emoji: 'bg-green-500', description: 'Nurture your skin with intention', category: 'Self-Care' },
      { title: 'Take 10 deep breaths before meals', emoji: 'bg-green-500', description: 'Center yourself before eating', category: 'Self-Care' },
      { title: 'Stretch for 5 minutes', emoji: 'bg-green-500', description: 'Keep your body flexible', category: 'Self-Care' },
      { title: 'Write down 3 things you did well', emoji: 'bg-green-500', description: 'Celebrate your daily wins', category: 'Self-Care' }
    ],
    confidence: [
      { title: 'Stand in power pose for 2 minutes', emoji: 'bg-yellow-500', description: 'Embody confidence physically', category: 'Confidence' },
      { title: 'Speak up in one meeting/conversation', emoji: 'bg-yellow-500', description: 'Practice sharing your voice', category: 'Confidence' },
      { title: 'Wear something that makes you feel good', emoji: 'bg-yellow-500', description: 'Dress for confidence', category: 'Confidence' },
      { title: 'Write one accomplishment from today', emoji: 'bg-yellow-500', description: 'Acknowledge your achievements', category: 'Confidence' }
    ],
    mindfulness: [
      { title: 'Notice 5 things you can see right now', emoji: 'bg-indigo-500', description: 'Practice present moment awareness', category: 'Mindfulness' },
      { title: 'Eat one meal without distractions', emoji: 'bg-indigo-500', description: 'Mindful eating practice', category: 'Mindfulness' },
      { title: 'Take 3 conscious breaths before responding', emoji: 'bg-indigo-500', description: 'Pause before reacting', category: 'Mindfulness' },
      { title: 'Write one thing you\'re grateful for', emoji: 'bg-indigo-500', description: 'Cultivate appreciation', category: 'Mindfulness' }
    ]
  };

  // Load habits from localStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem('habit_tracker_habits');
    if (savedHabits) {
      const habitData: HabitData = JSON.parse(savedHabits);
      setHabits(habitData.habits || []);
    } else {
      // Show suggestions for first-time users
      setShowSuggestions(true);
    }
  }, []);

  // Save habits to localStorage
  const saveHabits = (updatedHabits: Habit[]) => {
    const habitData: HabitData = {
      habits: updatedHabits,
      lastUpdated: new Date().toISOString()
    };
    
    setHabits(updatedHabits);
    localStorage.setItem('habit_tracker_habits', JSON.stringify(habitData));
    
    // Show save animation
    setShowSaveAnimation(true);
    setTimeout(() => setShowSaveAnimation(false), 2000);
  };

  // Add new habit
  const addHabit = (habitData?: HabitSuggestion) => {
    const habit: Habit = {
      id: Date.now().toString(),
      title: habitData?.title || newHabit.title,
      emoji: habitData?.emoji || newHabit.emoji,
      frequency: newHabit.frequency,
      customDays: newHabit.customDays,
      reminderTime: newHabit.reminderTime,
      reminderEnabled: newHabit.reminderEnabled,
      streak: 0,
      longestStreak: 0,
      completedDates: [],
      createdDate: new Date().toISOString().split('T')[0],
      category: habitData?.category || newHabit.category,
      description: habitData?.description || newHabit.description,
      lastUpdated: new Date().toISOString()
    };

    const updatedHabits = [...habits, habit];
    saveHabits(updatedHabits);
    
    // Reset form
    setNewHabit({
      title: '',
      emoji: '✅',
      frequency: 'daily',
      customDays: [],
      reminderTime: '09:00',
      reminderEnabled: true,
      category: 'Personal Growth',
      description: ''
    });
    
    setShowAddForm(false);
    setShowSuggestions(false);
  };

  // Toggle habit completion
  const toggleHabit = (habitId: string, date: string = selectedDate) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(date);
        let newCompletedDates;
        let newStreak = habit.streak;
        
        if (isCompleted) {
          // Remove completion
          newCompletedDates = habit.completedDates.filter(d => d !== date);
          // Recalculate streak
          newStreak = calculateStreak(newCompletedDates);
        } else {
          // Add completion
          newCompletedDates = [...habit.completedDates, date].sort();
          newStreak = calculateStreak(newCompletedDates);
          
          // Track activity for main streak system
          addActivity('habit_completion');
          
          // Check if all habits are completed today
          const todayHabits = habits.filter(h => shouldShowHabitForDate(h, date));
          const completedToday = todayHabits.filter(h => 
            h.id === habitId ? true : h.completedDates.includes(date)
          );
          
          if (completedToday.length === todayHabits.length) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
          }
        }
        
        return {
          ...habit,
          completedDates: newCompletedDates,
          streak: newStreak,
          longestStreak: Math.max(habit.longestStreak, newStreak),
          lastUpdated: new Date().toISOString()
        };
      }
      return habit;
    });
    
    saveHabits(updatedHabits);
  };

  // Calculate current streak for a habit
  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    
    const sortedDates = completedDates.sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    
    // Check if completed today or yesterday (to account for different timezones)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      streak = 1;
      
      // Count consecutive days
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i-1]);
        const prevDate = new Date(sortedDates[i]);
        const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return streak;
  };

  // Check if habit should be shown for a specific date
  const shouldShowHabitForDate = (habit: Habit, date: string): boolean => {
    if (habit.frequency === 'daily') return true;
    
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return habit.customDays?.includes(dayOfWeek) || false;
  };

  // Get habits for today
  const getTodayHabits = () => {
    return habits.filter(habit => shouldShowHabitForDate(habit, selectedDate));
  };

  // Get completion percentage for today
  const getTodayCompletionPercentage = () => {
    const todayHabits = getTodayHabits();
    if (todayHabits.length === 0) return 0;
    
    const completedToday = todayHabits.filter(habit => 
      habit.completedDates.includes(selectedDate)
    ).length;
    
    return Math.round((completedToday / todayHabits.length) * 100);
  };

  // Delete habit
  const deleteHabit = (habitId: string) => {
    const updatedHabits = habits.filter(h => h.id !== habitId);
    saveHabits(updatedHabits);
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

  // Render habit suggestions
  const renderSuggestions = () => (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card-surface rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Lightbulb className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-primary-custom mb-2">
            What's your personal development goal?
          </h2>
          <p className="text-secondary-custom">
            Choose a focus area and we'll suggest powerful habits to help you grow
          </p>
        </div>

        {!selectedGoal ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goalCategories.map((goal) => (
              <motion.button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className="p-6 bg-white/5 rounded-2xl border border-card-custom hover:border-purple-300 dark:hover:border-purple-500 transition-all text-left group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full bg-card-surface ${goal.color} group-hover:scale-110 transition-transform`}>
                    <goal.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-custom">{goal.label}</h3>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center mb-6">
              <button
                onClick={() => setSelectedGoal('')}
                className="mr-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-secondary-custom" />
              </button>
              <h3 className="text-xl font-bold text-primary-custom">
                Suggested Habits for {goalCategories.find(g => g.id === selectedGoal)?.label}
              </h3>
            </div>

            <div className="space-y-4">
              {habitSuggestions[selectedGoal]?.map((suggestion, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-white/5 rounded-2xl border border-card-custom"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <span className="text-2xl">{suggestion.emoji}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary-custom mb-1">
                          {suggestion.title}
                        </h4>
                        <p className="text-sm text-secondary-custom mb-2">
                          {suggestion.description}
                        </p>
                        <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                          {suggestion.category}
                        </span>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => addHabit(suggestion)}
                      className="ml-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Add Habit
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setShowSuggestions(false)}
            className="px-6 py-3 text-secondary-custom hover:text-primary-custom transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-white/10 text-primary-custom rounded-xl font-medium hover:bg-white/20 transition-colors"
          >
            Create Custom Habit
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Render add habit form
  const renderAddForm = () => (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card-surface rounded-3xl p-8 max-w-md w-full shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <h2 className="text-2xl font-bold text-primary-custom mb-6">
          Create New Habit
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-custom mb-2">
              Habit Title
            </label>
            <input
              type="text"
              value={newHabit.title}
              onChange={(e) => setNewHabit({...newHabit, title: e.target.value})}
              className="w-full px-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent bg-card-surface text-primary-custom"
              placeholder="e.g., Read for 10 minutes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-custom mb-2">
              Color Theme
            </label>
            <div className="flex space-x-2">
              {['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'].map(colorClass => (
                <button
                  key={colorClass}
                  type="button"
                  onClick={() => setNewHabit({...newHabit, emoji: colorClass})}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${colorClass} ${
                    newHabit.emoji === colorClass
                      ? 'border-black dark:border-white scale-110 shadow-md'
                      : 'border-transparent hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-custom mb-2">
              Frequency
            </label>
            <select
              value={newHabit.frequency}
              onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value as 'daily' | 'custom'})}
              className="w-full px-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent bg-card-surface text-primary-custom"
            >
              <option value="daily">Daily</option>
              <option value="custom">Custom Days</option>
            </select>
          </div>

          {newHabit.frequency === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-secondary-custom mb-2">
                Select Days
              </label>
              <div className="grid grid-cols-7 gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <button
                    key={day}
                    onClick={() => {
                      const days = newHabit.customDays.includes(day)
                        ? newHabit.customDays.filter(d => d !== day)
                        : [...newHabit.customDays, day];
                      setNewHabit({...newHabit, customDays: days});
                    }}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      newHabit.customDays.includes(day)
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-secondary-custom'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary-custom mb-2">
              Reminder Time
            </label>
            <input
              type="time"
              value={newHabit.reminderTime}
              onChange={(e) => setNewHabit({...newHabit, reminderTime: e.target.value})}
              className="w-full px-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent bg-card-surface text-primary-custom"
            />
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
          <button
            onClick={() => setShowAddForm(false)}
            className="flex-1 py-3 border border-card-custom text-secondary-custom rounded-xl font-semibold hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => addHabit()}
            disabled={!newHabit.title.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            Create Habit
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Today view
  const renderTodayView = () => {
    const todayHabits = getTodayHabits();
    const completionPercentage = getTodayCompletionPercentage();
    
    return (
      <div className="space-y-6">
        {/* Progress Overview */}
        <motion.div
          className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-primary-custom">Today's Progress</h3>
              <p className="text-secondary-custom">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {completionPercentage}%
              </p>
              <p className="text-sm text-secondary-custom">Complete</p>
            </div>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          {completionPercentage === 100 && todayHabits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 text-center text-green-600 dark:text-green-400 font-semibold"
            >
              All habits completed! Amazing work!
            </motion.div>
          )}
        </motion.div>

        {/* Habits List */}
        <div className="space-y-4">
          {todayHabits.length === 0 ? (
            <motion.div
              className="bg-card-surface rounded-3xl p-8 shadow-lg border border-card-custom text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Target className="h-12 w-12 text-secondary-custom mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-custom mb-2">
                No habits for today
              </h3>
              <p className="text-secondary-custom mb-6">
                Start building powerful habits to transform your life
              </p>
              <button
                onClick={() => setShowSuggestions(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Get Habit Suggestions
              </button>
            </motion.div>
          ) : (
            todayHabits.map((habit, index) => {
              const isCompleted = habit.completedDates.includes(selectedDate);
              return (
                <motion.div
                  key={habit.id}
                  className={`bg-card-surface rounded-3xl p-6 shadow-lg border transition-all ${
                    isCompleted 
                      ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                      : 'border-card-custom'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <motion.button
                        onClick={() => toggleHabit(habit.id)}
                        className={`p-2 rounded-full transition-all ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white/5 text-secondary-custom hover:bg-purple-100 dark:hover:bg-purple-900/30'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                      </motion.button>
                      
                      <div className="flex items-center space-x-3 flex-1">
                        {(() => {
                          const IconComp = getCategoryIcon(habit.category);
                          return (
                            <div className={`p-2 rounded-xl text-white ${habit.emoji?.startsWith('bg-') ? habit.emoji : 'bg-purple-500'}`}>
                              <IconComp className="h-5 w-5" />
                            </div>
                          );
                        })()}
                        <div className="flex-1">
                          <h4 className={`font-semibold transition-all ${
                            isCompleted 
                              ? 'text-green-800 dark:text-green-300 line-through' 
                              : 'text-primary-custom'
                          }`}>
                            {habit.title}
                          </h4>
                          {habit.description && (
                            <p className="text-sm text-secondary-custom">
                              {habit.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <Flame className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                {habit.streak} day streak
                              </span>
                            </div>
                            <span className="text-xs text-secondary-custom">
                              Best: {habit.longestStreak} days
                            </span>
                            {habit.lastUpdated && (
                              <span className="text-xs text-secondary-custom">
                                Updated {formatLastUpdated(habit.lastUpdated)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {habit.reminderEnabled && (
                        <Bell className="h-4 w-4 text-blue-500" />
                      )}
                      <button
                        onClick={() => setEditingHabit(habit)}
                        className="p-2 text-secondary-custom hover:text-secondary-custom transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Analytics view
  const renderAnalyticsView = () => {
    const totalHabits = habits.length;
    const avgCompletion = habits.length > 0 
      ? Math.round(habits.reduce((sum, habit) => sum + (habit.completedDates.length / Math.max(1, Math.floor((Date.now() - new Date(habit.createdDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)), 0) / habits.length * 100)
      : 0;
    const totalCompletions = habits.reduce((sum, habit) => sum + habit.completedDates.length, 0);
    const bestStreak = Math.max(0, ...habits.map(h => h.longestStreak));

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            className="bg-card-surface rounded-2xl p-4 shadow-lg border border-card-custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-center">
              <Target className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary-custom">{totalHabits}</p>
              <p className="text-sm text-secondary-custom">Total Habits</p>
            </div>
          </motion.div>

          <motion.div
            className="bg-card-surface rounded-2xl p-4 shadow-lg border border-card-custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary-custom">{avgCompletion}%</p>
              <p className="text-sm text-secondary-custom">Avg Completion</p>
            </div>
          </motion.div>

          <motion.div
            className="bg-card-surface rounded-2xl p-4 shadow-lg border border-card-custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary-custom">{totalCompletions}</p>
              <p className="text-sm text-secondary-custom">Total Completions</p>
            </div>
          </motion.div>

          <motion.div
            className="bg-card-surface rounded-2xl p-4 shadow-lg border border-card-custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center">
              <Flame className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary-custom">{bestStreak}</p>
              <p className="text-sm text-secondary-custom">Best Streak</p>
            </div>
          </motion.div>
        </div>

        {/* Habits Performance */}
        <motion.div
          className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-primary-custom mb-6">Habit Performance</h3>
          
          <div className="space-y-4">
            {habits.map((habit, index) => {
              const completionRate = habit.completedDates.length > 0 
                ? Math.round((habit.completedDates.length / Math.max(1, Math.floor((Date.now() - new Date(habit.createdDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)) * 100)
                : 0;
              
              return (
                <motion.div
                  key={habit.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const IconComp = getCategoryIcon(habit.category);
                      return (
                        <div className={`p-1.5 rounded-lg text-white ${habit.emoji?.startsWith('bg-') ? habit.emoji : 'bg-purple-500'}`}>
                          <IconComp className="h-4 w-4" />
                        </div>
                      );
                    })()}
                    <div>
                      <p className="font-medium text-primary-custom">{habit.title}</p>
                      <p className="text-sm text-secondary-custom">
                        {habit.streak} day streak • Best: {habit.longestStreak}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {completionRate}%
                    </p>
                    <p className="text-xs text-secondary-custom">
                      {habit.completedDates.length} completions
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Save Animation */}
        {showSaveAnimation && (
          <motion.div
            className="fixed top-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-xl shadow-lg z-50"
            initial={{ opacity: 0, scale: 0, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0, x: 100 }}
          >
            Habits data saved
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
              className="mr-4 p-2 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-secondary-custom" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primary-custom">{t('habitTracker')}</h1>
              <p className="text-secondary-custom mt-1">Build powerful habits that transform your life</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => setShowSuggestions(true)}
              className="p-2 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </motion.button>
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-5 w-5" />
              <span>Add Habit</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex bg-card-surface rounded-2xl p-1 mb-8 shadow-lg border border-card-custom">
          {[
            { id: 'today', label: 'Today', icon: CheckCircle },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'calendar', label: 'Calendar', icon: Calendar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-secondary-custom hover:text-primary-custom hover:bg-white/5'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderTodayView()}
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderAnalyticsView()}
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card-surface rounded-3xl p-8 shadow-lg border border-card-custom text-center"
            >
              <Calendar className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-primary-custom mb-2">
                Calendar View
              </h3>
              <p className="text-secondary-custom">
                Coming soon! Visual calendar with habit completion tracking.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confetti Animation */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-40">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: -10,
                  scale: 0 
                }}
                animate={{ 
                  y: window.innerHeight + 10,
                  scale: [0, 1, 0],
                  rotate: 360
                }}
                transition={{ 
                  duration: 3,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showSuggestions && renderSuggestions()}
        {showAddForm && renderAddForm()}
      </AnimatePresence>
    </div>
  );
};

export default HabitTrackerPage;