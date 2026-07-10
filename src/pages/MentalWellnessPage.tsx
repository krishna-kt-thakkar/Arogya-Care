import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Heart, 
  Feather, 
  Save, 
  Calendar,
  Play,
  ExternalLink,
  Bell,
  BellOff,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Wind,
  Sun,
  Moon,
  Coffee,
  AlertCircle,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useStreak } from '../contexts/StreakContext';
import Header from '../components/layout/Header';

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: string;
  gratitude: string;
  timestamp: number;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  amazonUrl: string;
  category: string;
}

interface YogaVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  youtubeId: string;
  type: 'morning' | 'evening';
}

interface DraftData {
  content: string;
  gratitude: string;
  mood: string;
  lastModified: number;
}

const MentalWellnessPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addActivity } = useStreak();
  
  // State management
  const [activeTab, setActiveTab] = useState<'journal' | 'books' | 'yoga'>('journal');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [currentGratitude, setCurrentGratitude] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [showPastEntries, setShowPastEntries] = useState(false);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [selectedTime, setSelectedTime] = useState<'morning' | 'evening'>('morning');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('mental_wellness_journal');
    const savedSettings = localStorage.getItem('mental_wellness_settings');
    const savedDraft = localStorage.getItem('mental_wellness_draft');
    
    if (savedEntries) {
      setJournalEntries(JSON.parse(savedEntries));
    }
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setReminderEnabled(settings.reminderEnabled ?? true);
    }

    // Load draft if exists and no entry for today
    if (savedDraft) {
      const draft: DraftData = JSON.parse(savedDraft);
      const today = new Date().toISOString().split('T')[0];
      const todaysEntry = JSON.parse(savedEntries || '[]').find((entry: JournalEntry) => entry.date === today);
      
      if (!todaysEntry && draft.lastModified > Date.now() - 24 * 60 * 60 * 1000) {
        setCurrentEntry(draft.content);
        setCurrentGratitude(draft.gratitude);
        setSelectedMood(draft.mood);
        setHasUnsavedChanges(true);
      }
    }
  }, []);

  // Save data to localStorage
  const saveEntries = (entries: JournalEntry[]) => {
    setJournalEntries(entries);
    localStorage.setItem('mental_wellness_journal', JSON.stringify(entries));
  };

  const saveSettings = () => {
    const settings = { reminderEnabled };
    localStorage.setItem('mental_wellness_settings', JSON.stringify(settings));
  };

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    if (currentEntry.trim() || currentGratitude.trim() || selectedMood) {
      const draft: DraftData = {
        content: currentEntry,
        gratitude: currentGratitude,
        mood: selectedMood,
        lastModified: Date.now()
      };
      localStorage.setItem('mental_wellness_draft', JSON.stringify(draft));
    } else {
      localStorage.removeItem('mental_wellness_draft');
    }
  }, [currentEntry, currentGratitude, selectedMood]);

  // Clear draft
  const clearDraft = () => {
    localStorage.removeItem('mental_wellness_draft');
    setHasUnsavedChanges(false);
  };

  // Auto-save functionality
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      if (currentEntry.trim() || currentGratitude.trim() || selectedMood) {
        setIsAutoSaving(true);
        saveDraft();
        setTimeout(() => {
          setIsAutoSaving(false);
          setLastSaved(new Date());
        }, 1000);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    setAutoSaveTimer(timer);
  }, [currentEntry, currentGratitude, selectedMood, autoSaveTimer, saveDraft]);

  // Handle input changes with auto-save
  const handleEntryChange = (value: string) => {
    setCurrentEntry(value);
    setHasUnsavedChanges(true);
    triggerAutoSave();
  };

  const handleGratitudeChange = (value: string) => {
    setCurrentGratitude(value);
    setHasUnsavedChanges(true);
    triggerAutoSave();
  };

  const handleMoodChange = (mood: string) => {
    setSelectedMood(mood);
    setHasUnsavedChanges(true);
    triggerAutoSave();
  };

  useEffect(() => {
    saveSettings();
  }, [reminderEnabled]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  // Handle page navigation with unsaved changes
  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges && (currentEntry.trim() || currentGratitude.trim())) {
      setShowUnsavedWarning(true);
      return;
    }
    navigate(path);
  };

  // Handle tab change with unsaved changes
  const handleTabChange = (tab: 'journal' | 'books' | 'yoga') => {
    if (activeTab === 'journal' && hasUnsavedChanges && (currentEntry.trim() || currentGratitude.trim())) {
      setShowUnsavedWarning(true);
      return;
    }
    
    // Track activity based on tab
    if (tab === 'yoga') {
      addActivity('yoga_practice');
    } else if (tab === 'journal') {
      addActivity('journaling');
    }
    
    setActiveTab(tab);
  };

  // Mood options
  const moods = [
    { icon: Smile, name: 'Happy', color: 'text-yellow-500', bg: 'bg-yellow-100/10' },
    { icon: Frown, name: 'Sad', color: 'text-blue-500', bg: 'bg-blue-100/10' },
    { icon: Meh, name: 'Neutral', color: 'text-secondary-custom', bg: 'bg-white/5/10' },
    { icon: Laugh, name: 'Excited', color: 'text-orange-500', bg: 'bg-orange-100/10' },
    { icon: Angry, name: 'Angry', color: 'text-red-500', bg: 'bg-red-100/10' },
    { icon: AlertCircle, name: 'Anxious', color: 'text-purple-500', bg: 'bg-purple-100/10' },
    { icon: Heart, name: 'Grateful', color: 'text-pink-500', bg: 'bg-pink-100/10' },
    { icon: Moon, name: 'Tired', color: 'text-indigo-500', bg: 'bg-indigo-100/10' }
  ];

  // Book recommendations
  const books: Book[] = [
    {
      id: '1',
      title: 'The Power of Now',
      author: 'Eckhart Tolle',
      description: 'A guide to spiritual enlightenment that teaches you to live in the present moment and find peace within yourself.',
      coverUrl: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=300',
      amazonUrl: 'https://www.amazon.com/Power-Now-Guide-Spiritual-Enlightenment/dp/1577314808',
      category: 'Mindfulness'
    },
    {
      id: '2',
      title: 'Atomic Habits',
      author: 'James Clear',
      description: 'Learn how to build good habits and break bad ones with this practical guide to behavior change.',
      coverUrl: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=300',
      amazonUrl: 'https://www.amazon.com/Atomic-Habits-Proven-Build-Break/dp/0735211299',
      category: 'Self-Improvement'
    },
    {
      id: '3',
      title: 'Ikigai',
      author: 'Francesc Miralles',
      description: 'Discover the Japanese secret to a long and happy life through finding your purpose and passion.',
      coverUrl: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=300',
      amazonUrl: 'https://www.amazon.com/Ikigai-Japanese-Secret-Long-Happy/dp/0143130722',
      category: 'Philosophy'
    },
    {
      id: '4',
      title: 'The Subtle Art of Not Giving a F*ck',
      author: 'Mark Manson',
      description: 'A counterintuitive approach to living a good life by focusing on what truly matters.',
      coverUrl: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=300',
      amazonUrl: 'https://www.amazon.com/Subtle-Art-Not-Giving-Counterintuitive/dp/0062457713',
      category: 'Self-Help'
    },
    {
      id: '5',
      title: "Can't Hurt Me",
      author: 'David Goggins',
      description: 'Master your mind and defy the odds through mental toughness and self-discipline.',
      coverUrl: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=300',
      amazonUrl: 'https://www.amazon.com/Cant-Hurt-Me-Master-Clean/dp/1544512287',
      category: 'Motivation'
    },
    {
      id: '6',
      title: 'Mindfulness in Plain English',
      author: 'Bhante Henepola Gunaratana',
      description: 'A clear and practical guide to meditation and mindfulness practice for beginners.',
      coverUrl: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=300',
      amazonUrl: 'https://www.amazon.com/Mindfulness-Plain-English-Bhante-Gunaratana/dp/0861719069',
      category: 'Meditation'
    }
  ];

  // Yoga videos by day
  const yogaVideos: { [key: string]: { morning: YogaVideo[], evening: YogaVideo[] } } = {
    monday: {
      morning: [
        {
          id: 'mon-m1',
          title: 'Energizing Morning Flow',
          description: 'Wake up your body with gentle stretches | Beginner | 20 min',
          duration: '20 min',
          level: 'Beginner',
          youtubeId: 'VaoV1PrYft4',
          type: 'morning'
        },
        {
          id: 'mon-m2',
          title: 'Monday Motivation Yoga',
          description: 'Start your week strong | Intermediate | 30 min',
          duration: '30 min',
          level: 'Intermediate',
          youtubeId: 'GLy2rYHwUqY',
          type: 'morning'
        }
      ],
      evening: [
        {
          id: 'mon-e1',
          title: 'Relaxing Evening Stretch',
          description: 'Unwind after a long day | All levels | 25 min',
          duration: '25 min',
          level: 'All levels',
          youtubeId: 'BiWnaZ2nAD4',
          type: 'evening'
        }
      ]
    },
    tuesday: {
      morning: [
        {
          id: 'tue-m1',
          title: 'Core Strengthening Flow',
          description: 'Build core strength mindfully | Intermediate | 25 min',
          duration: '25 min',
          level: 'Intermediate',
          youtubeId: 'VaoV1PrYft4',
          type: 'morning'
        }
      ],
      evening: [
        {
          id: 'tue-e1',
          title: 'Gentle Hip Openers',
          description: 'Release tension from sitting | Beginner | 20 min',
          duration: '20 min',
          level: 'Beginner',
          youtubeId: 'BiWnaZ2nAD4',
          type: 'evening'
        }
      ]
    },
    wednesday: {
      morning: [
        {
          id: 'wed-m1',
          title: 'Midweek Reset Flow',
          description: 'Refresh your energy | All levels | 30 min',
          duration: '30 min',
          level: 'All levels',
          youtubeId: 'GLy2rYHwUqY',
          type: 'morning'
        }
      ],
      evening: [
        {
          id: 'wed-e1',
          title: 'Stress Relief Yoga',
          description: 'Melt away midweek stress | Beginner | 25 min',
          duration: '25 min',
          level: 'Beginner',
          youtubeId: 'BiWnaZ2nAD4',
          type: 'evening'
        }
      ]
    },
    thursday: {
      morning: [
        {
          id: 'thu-m1',
          title: 'Balance & Focus Flow',
          description: 'Improve balance and concentration | Intermediate | 25 min',
          duration: '25 min',
          level: 'Intermediate',
          youtubeId: 'VaoV1PrYft4',
          type: 'morning'
        }
      ],
      evening: [
        {
          id: 'thu-e1',
          title: 'Shoulder & Neck Release',
          description: 'Perfect for desk workers | All levels | 20 min',
          duration: '20 min',
          level: 'All levels',
          youtubeId: 'BiWnaZ2nAD4',
          type: 'evening'
        }
      ]
    },
    friday: {
      morning: [
        {
          id: 'fri-m1',
          title: 'Feel-Good Friday Flow',
          description: 'Celebrate the week | All levels | 30 min',
          duration: '30 min',
          level: 'All levels',
          youtubeId: 'GLy2rYHwUqY',
          type: 'morning'
        }
      ],
      evening: [
        {
          id: 'fri-e1',
          title: 'Weekend Prep Relaxation',
          description: 'Transition into weekend mode | Beginner | 25 min',
          duration: '25 min',
          level: 'Beginner',
          youtubeId: 'BiWnaZ2nAD4',
          type: 'evening'
        }
      ]
    },
    saturday: {
      morning: [
        {
          id: 'sat-m1',
          title: 'Weekend Warrior Flow',
          description: 'Energize your Saturday | Intermediate | 35 min',
          duration: '35 min',
          level: 'Intermediate',
          youtubeId: 'VaoV1PrYft4',
          type: 'morning'
        }
      ],
      evening: [
        {
          id: 'sat-e1',
          title: 'Saturday Night Restore',
          description: 'Deep relaxation practice | All levels | 30 min',
          duration: '30 min',
          level: 'All levels',
          youtubeId: 'BiWnaZ2nAD4',
          type: 'evening'
        }
      ]
    },
    sunday: {
      morning: [
        {
          id: 'sun-m1',
          title: 'Sunday Self-Care Flow',
          description: 'Gentle practice for rest day | Beginner | 25 min',
          duration: '25 min',
          level: 'Beginner',
          youtubeId: 'GLy2rYHwUqY',
          type: 'morning'
        }
      ],
      evening: [
        {
          id: 'sun-e1',
          title: 'Week Prep Meditation',
          description: 'Prepare for the week ahead | All levels | 20 min',
          duration: '20 min',
          level: 'All levels',
          youtubeId: 'BiWnaZ2nAD4',
          type: 'evening'
        }
      ]
    }
  };

  // Save journal entry
  const saveJournalEntry = async () => {
    if (!currentEntry.trim() && !currentGratitude.trim()) return;
    
    setIsSaving(true);
    
    // Simulate saving animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      content: currentEntry,
      gratitude: currentGratitude,
      mood: selectedMood,
      timestamp: Date.now()
    };
    
    const updatedEntries = [newEntry, ...journalEntries];
    saveEntries(updatedEntries);
    
    // Add streak activity for journaling
    addActivity('journaling');
    
    // Clear form and draft
    setCurrentEntry('');
    setCurrentGratitude('');
    setSelectedMood('');
    clearDraft();
    setIsSaving(false);
    setLastSaved(new Date());
  };

  // Get today's entry
  const getTodaysEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    return journalEntries.find(entry => entry.date === today);
  };

  // Unsaved changes warning component
  const UnsavedWarningModal = () => (
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
        <div className="text-center">
          <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          
          <h3 className="text-xl font-bold text-primary-custom mb-4">
            You've written something meaningful
          </h3>
          
          <p className="text-secondary-custom mb-6 leading-relaxed">
            Would you like to save it before leaving? Your thoughts are precious and shouldn't be lost.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                clearDraft();
                setShowUnsavedWarning(false);
                if (activeTab !== 'journal') {
                  setActiveTab(activeTab);
                } else {
                  navigate('/dashboard');
                }
              }}
              className="flex-1 py-3 border border-card-custom text-secondary-custom rounded-xl font-semibold hover:bg-white/5 transition-colors"
            >
              Don't Save
            </button>
            <button
              onClick={async () => {
                await saveJournalEntry();
                setShowUnsavedWarning(false);
                if (activeTab !== 'journal') {
                  setActiveTab(activeTab);
                } else {
                  navigate('/dashboard');
                }
              }}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Save & Continue
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  // Journal component
  const JournalView = () => {
    const todaysEntry = getTodaysEntry();
    
    return (
      <div className="space-y-6">
        {/* Motivational message */}
        <motion.div
          className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6 border border-purple-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="h-6 w-6 text-purple-600 mr-3" />
            </motion.div>
            <h3 className="text-lg font-semibold text-purple-800">Daily Reflection</h3>
          </div>
          <p className="text-purple-700 leading-relaxed">
            Take a moment to breathe. Write something you're grateful for today.
          </p>
        </motion.div>

        {/* Auto-save indicator */}
        <AnimatePresence>
          {(isAutoSaving || lastSaved) && (
            <motion.div
              className="flex items-center justify-center space-x-2 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {isAutoSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  </motion.div>
                  <span className="text-purple-600">Auto-saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">
                    Draft saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's entry form */}
        {!todaysEntry && (
          <motion.div
            className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-bold text-primary-custom mb-6">How was your day?</h3>
            
            {/* Mood selection */}
            <div className="mb-6">
              <p className="text-sm font-medium text-secondary-custom mb-3">How are you feeling?</p>
              <div className="grid grid-cols-4 gap-3">
                {moods.map((mood) => {
                  const IconComponent = mood.icon;
                  return (
                    <motion.button
                      key={mood.name}
                      type="button"
                      onClick={() => handleMoodChange(mood.name)}
                      className={`p-3 rounded-xl border transition-all ${
                        selectedMood === mood.name
                          ? 'border-purple-500 bg-purple-500/15 shadow-md'
                          : 'border-card-custom hover:border-purple-500/30 bg-card-surface/40'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-center flex flex-col items-center">
                        <IconComponent className={`h-6 w-6 mb-1.5 ${mood.color}`} />
                        <p className={`text-xs font-semibold ${
                          selectedMood === mood.name ? mood.color : 'text-secondary-custom'
                        }`}>
                          {mood.name}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Gratitude section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-custom mb-3">
                What are you grateful for today?
              </label>
              <textarea
                value={currentGratitude}
                onChange={(e) => handleGratitudeChange(e.target.value)}
                className="w-full h-24 px-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent resize-none bg-card-surface/40 transition-all text-primary-custom"
                placeholder="I'm grateful for..."
                onKeyDown={(e) => {
                  // Prevent form submission on Enter
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    saveJournalEntry();
                  }
                }}
              />
            </div>

            {/* Journal entry */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-custom mb-3">
                Tell your diary about your day
              </label>
              <textarea
                value={currentEntry}
                onChange={(e) => handleEntryChange(e.target.value)}
                className="w-full h-32 px-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent resize-none bg-gradient-to-br from-blue-50 to-purple-50 transition-all"
                placeholder="Dear diary, today was..."
                onKeyDown={(e) => {
                  // Prevent form submission on Enter
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    saveJournalEntry();
                  }
                }}
              />
              <p className="text-xs text-secondary-custom mt-2">
                Tip: Press Ctrl+Enter to save quickly
              </p>
            </div>

            {/* Save button */}
            <motion.button
              type="button"
              onClick={saveJournalEntry}
              disabled={isSaving || (!currentEntry.trim() && !currentGratitude.trim())}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-5 w-5" />
                  </motion.div>
                  <span>Saving your thoughts...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Entry</span>
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Today's completed entry */}
        {todaysEntry && (
          <motion.div
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-500 rounded-full p-2 mr-3">
                <Feather className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Today's Entry Complete!</h3>
                <p className="text-sm text-green-600">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            {todaysEntry.mood && (
              <div className="mb-4">
                <p className="text-sm text-green-700 mb-2">Mood: {todaysEntry.mood}</p>
              </div>
            )}
            
            {todaysEntry.gratitude && (
              <div className="mb-4">
                <p className="text-sm font-medium text-green-800 mb-2">Gratitude:</p>
                <p className="text-green-700 bg-white/50 p-3 rounded-xl">{todaysEntry.gratitude}</p>
              </div>
            )}
            
            {todaysEntry.content && (
              <div>
                <p className="text-sm font-medium text-green-800 mb-2">Journal:</p>
                <p className="text-green-700 bg-white/50 p-3 rounded-xl">{todaysEntry.content}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Past entries */}
        <motion.div
          className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary-custom">Past Entries</h3>
            <button
              type="button"
              onClick={() => setShowPastEntries(!showPastEntries)}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <span className="text-sm font-medium">
                {showPastEntries ? 'Hide' : 'Show'} ({journalEntries.length})
              </span>
              {showPastEntries ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          <AnimatePresence>
            {showPastEntries && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 max-h-96 overflow-y-auto"
              >
                {journalEntries.length === 0 ? (
                  <p className="text-secondary-custom text-center py-8">No entries yet. Start writing!</p>
                ) : (
                  journalEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      className="p-4 bg-white/5 rounded-xl border border-card-custom"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium text-primary-custom">
                          {new Date(entry.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        {entry.mood && (
                          <span className="text-sm text-secondary-custom bg-card-surface px-2 py-1 rounded-full">
                            {entry.mood}
                          </span>
                        )}
                      </div>
                      
                      {entry.gratitude && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-secondary-custom mb-1">Gratitude:</p>
                          <p className="text-sm text-secondary-custom">{entry.gratitude}</p>
                        </div>
                      )}
                      
                      {entry.content && (
                        <div>
                          <p className="text-xs font-medium text-secondary-custom mb-1">Journal:</p>
                          <p className="text-sm text-secondary-custom">{entry.content}</p>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  };

  // Books component
  const BooksView = () => (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl p-6 border border-blue-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center mb-4">
          <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-blue-800">Recommended Reading</h3>
        </div>
        <p className="text-blue-700">
          Discover books that can transform your mindset and improve your mental well-being.
        </p>
      </motion.div>

      {/* Books grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book, index) => (
          <motion.div
            key={book.id}
            className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom hover:shadow-xl transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            {/* Book cover */}
            <div className="mb-4">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-48 object-cover rounded-xl shadow-md"
              />
            </div>

            {/* Book details */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-primary-custom text-lg leading-tight">{book.title}</h4>
                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                  {book.category}
                </span>
              </div>
              <p className="text-sm text-secondary-custom mb-3">by {book.author}</p>
              <p className="text-sm text-secondary-custom leading-relaxed">{book.description}</p>
            </div>

            {/* Action button */}
            <motion.a
              href={book.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BookOpen className="h-5 w-5" />
              <span>View on Amazon</span>
              <ExternalLink className="h-4 w-4" />
            </motion.a>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Yoga component
  const YogaView = () => {
    const currentVideos = yogaVideos[selectedDay]?.[selectedTime] || [];
    
    return (
      <div className="space-y-6">
        {/* Header with quote */}
        <motion.div
          className="bg-gradient-to-r from-green-100 to-teal-100 rounded-3xl p-6 border border-green-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center mb-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Wind className="h-6 w-6 text-green-600 mr-3" />
            </motion.div>
            <h3 className="text-lg font-semibold text-green-800">Daily Yoga Practice</h3>
          </div>
          <p className="text-green-700 leading-relaxed">
            Your breath anchors you. Flow gently today.
          </p>
        </motion.div>

        {/* Day and time selectors */}
        <motion.div
          className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Day selector */}
            <div>
              <label className="block text-sm font-medium text-secondary-custom mb-3">
                Select Day
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-4 py-3 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent"
              >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>

            {/* Time selector */}
            <div>
              <label className="block text-sm font-medium text-secondary-custom mb-3">
                Practice Time
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTime('morning')}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center space-x-2 ${
                    selectedTime === 'morning'
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                      : 'border-card-custom hover:border-yellow-200 text-secondary-custom'
                  }`}
                >
                  <Sun className="h-5 w-5" />
                  <span className="font-medium">Morning</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTime('evening')}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center space-x-2 ${
                    selectedTime === 'evening'
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                      : 'border-card-custom hover:border-indigo-200 text-secondary-custom'
                  }`}
                >
                  <Moon className="h-5 w-5" />
                  <span className="font-medium">Evening</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Video list */}
        <div className="space-y-4">
          {currentVideos.map((video, index) => (
            <motion.div
              key={video.id}
              className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video embed */}
                <div className="lg:col-span-2">
                  <div className="relative aspect-video rounded-xl overflow-hidden shadow-md">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={video.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* Video details */}
                <div className="flex flex-col justify-center">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-primary-custom mb-2">{video.title}</h4>
                    <p className="text-secondary-custom leading-relaxed">{video.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {video.duration}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {video.level}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      video.type === 'morning' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {video.type === 'morning' ? 'Morning' : 'Evening'}
                    </span>
                  </div>

                  <motion.button
                    type="button"
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      addActivity('yoga_practice');
                      window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank');
                    }}
                  >
                    <Play className="h-5 w-5" />
                    <span>Watch on YouTube</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleNavigation('/dashboard')}
              className="mr-4 p-2 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-secondary-custom" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-primary-custom">{t('mentalWellness')}</h1>
              <p className="text-secondary-custom mt-1">Nurture your mind, body, and soul</p>
            </div>
          </div>
          
          <motion.button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="h-5 w-5 text-secondary-custom" />
          </motion.button>
        </motion.div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="mb-8 bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3 className="text-lg font-semibold text-primary-custom mb-4">Settings</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-purple-600" />
                  <div>
                    <span className="text-secondary-custom font-medium">Daily Journal Reminder</span>
                    <p className="text-sm text-secondary-custom">Get reminded at 9 PM: "How did your day go? Tell your diary"</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    reminderEnabled ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-card-surface rounded-full shadow-md transform transition-transform ${
                      reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <div className="flex bg-card-surface rounded-2xl p-1 mb-8 shadow-lg border border-card-custom">
          {[
            { id: 'journal', label: 'Gratitude Journal', icon: Feather },
            { id: 'books', label: 'Book Recommendations', icon: BookOpen },
            { id: 'yoga', label: 'Daily Yoga', icon: Wind }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id as any)}
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
          {activeTab === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <JournalView />
            </motion.div>
          )}

          {activeTab === 'books' && (
            <motion.div
              key="books"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <BooksView />
            </motion.div>
          )}

          {activeTab === 'yoga' && (
            <motion.div
              key="yoga"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <YogaView />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saving animation overlay */}
        {isSaving && (
          <motion.div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-card-surface rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
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
                <Feather className="h-12 w-12 text-purple-600 mx-auto" />
              </motion.div>
              <p className="text-lg font-semibold text-primary-custom">Saving your thoughts...</p>
              <p className="text-secondary-custom mt-2">Your words are precious</p>
            </motion.div>
          </motion.div>
        )}

        {/* Unsaved changes warning */}
        <AnimatePresence>
          {showUnsavedWarning && <UnsavedWarningModal />}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MentalWellnessPage;