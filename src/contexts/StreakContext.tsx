import React, { createContext, useContext, useState, useEffect } from 'react';

interface Badge {
  id: string;
  name: string;
  symbol: string;
  description: string;
  daysRequired: number;
  color: string;
  bgColor: string;
  aura: string;
  unlocked: boolean;
  unlockedDate?: string;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  totalActiveDays: number;
  badges: Badge[];
}

interface StreakContextType {
  streakData: StreakData;
  addActivity: (activityType: string) => void;
  getNextBadge: () => Badge | null;
  showBadgeUnlock: boolean;
  newlyUnlockedBadge: Badge | null;
  dismissBadgeUnlock: () => void;
  resetStreak: () => void;
  exportBadge: (badge: Badge) => void;
}

const defaultBadges: Badge[] = [
  {
    id: 'spark',
    name: 'Consistency Spark',
    symbol: 'Spark',
    description: 'The first flame of habit has been lit. Keep going. Greatness awaits.',
    daysRequired: 7,
    color: 'text-blue-400',
    bgColor: 'bg-blue-100',
    aura: 'shadow-blue-400/50',
    unlocked: false
  },
  {
    id: 'warrior',
    name: 'Habit Warrior',
    symbol: 'Warrior',
    description: 'You\'ve proven your commitment. The warrior spirit awakens within.',
    daysRequired: 30,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    aura: 'shadow-yellow-400/50',
    unlocked: false
  },
  {
    id: 'centurion',
    name: 'Centurion Spirit',
    symbol: 'Centurion',
    description: 'A true warrior of discipline. Your dedication inspires others.',
    daysRequired: 100,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    aura: 'shadow-orange-400/50',
    unlocked: false
  },
  {
    id: 'iron',
    name: 'Iron Resolve',
    symbol: 'Iron Resolve',
    description: 'Steel-sharp consistency. Your willpower is unbreakable.',
    daysRequired: 365,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    aura: 'shadow-gray-400/50',
    unlocked: false
  },
  {
    id: 'titan',
    name: 'Titan of Time',
    symbol: 'Titan',
    description: 'Legendary habit builder. You\'ve transcended ordinary limits.',
    daysRequired: 1000,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    aura: 'shadow-red-400/50',
    unlocked: false
  },
  {
    id: 'eternal',
    name: 'Eternal Flame',
    symbol: 'Eternal',
    description: 'Unstoppable and ever-burning. Your flame will never die.',
    daysRequired: 2000,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    aura: 'shadow-indigo-400/50',
    unlocked: false
  },
  {
    id: 'immortal',
    name: 'Immortal Streak',
    symbol: 'Immortal',
    description: 'God-tier discipline. You\'ve achieved the impossible.',
    daysRequired: 3000,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    aura: 'shadow-purple-400/50',
    unlocked: false
  },
  {
    id: 'infinite',
    name: 'The Infinite',
    symbol: 'Infinite',
    description: 'Beyond limits of time. You are one with the eternal flow.',
    daysRequired: 4000,
    color: 'text-black',
    bgColor: 'bg-gray-900',
    aura: 'shadow-black/50',
    unlocked: false
  },
  {
    id: 'legacy',
    name: 'Legacy Legend',
    symbol: 'Legend',
    description: 'A timeless symbol of self-mastery. Your legend will inspire generations.',
    daysRequired: 5000,
    color: 'text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text',
    bgColor: 'bg-gradient-to-r from-purple-100 to-pink-100',
    aura: 'shadow-purple-500/50',
    unlocked: false
  }
];

const StreakContext = createContext<StreakContextType | undefined>(undefined);

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};

export const StreakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    totalActiveDays: 0,
    badges: defaultBadges
  });
  
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(null);

  // Load streak data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('streak_data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Merge with default badges to ensure new badges are added
      const mergedBadges = defaultBadges.map(defaultBadge => {
        const savedBadge = parsed.badges?.find((b: Badge) => b.id === defaultBadge.id);
        return savedBadge ? { ...defaultBadge, ...savedBadge } : defaultBadge;
      });
      
      setStreakData({
        ...parsed,
        badges: mergedBadges
      });
    }
  }, []);

  // Save streak data to localStorage
  const saveStreakData = (data: StreakData) => {
    setStreakData(data);
    localStorage.setItem('streak_data', JSON.stringify(data));
  };

  const addActivity = (_activityType: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Don't add if already logged today
    if (streakData.lastActivityDate === today) {
      return;
    }

    let newStreak = streakData.currentStreak;
    
    // Check if this continues the streak
    if (streakData.lastActivityDate === yesterday) {
      newStreak = streakData.currentStreak + 1;
    } else if (streakData.lastActivityDate === today) {
      // Already logged today
      return;
    } else {
      // Streak broken, start new
      newStreak = 1;
    }

    const newData: StreakData = {
      ...streakData,
      currentStreak: newStreak,
      longestStreak: Math.max(streakData.longestStreak, newStreak),
      lastActivityDate: today,
      totalActiveDays: streakData.totalActiveDays + 1
    };

    // Check for badge unlocks
    const updatedBadges = newData.badges.map(badge => {
      if (!badge.unlocked && newStreak >= badge.daysRequired) {
        setNewlyUnlockedBadge({ ...badge, unlocked: true, unlockedDate: today });
        setShowBadgeUnlock(true);
        return { ...badge, unlocked: true, unlockedDate: today };
      }
      return badge;
    });

    newData.badges = updatedBadges;
    saveStreakData(newData);
  };

  const getNextBadge = (): Badge | null => {
    const unlockedBadges = streakData.badges.filter(b => !b.unlocked);
    if (unlockedBadges.length === 0) return null;
    
    return unlockedBadges.reduce((next, current) => 
      current.daysRequired < next.daysRequired ? current : next
    );
  };

  const dismissBadgeUnlock = () => {
    setShowBadgeUnlock(false);
    setNewlyUnlockedBadge(null);
  };

  const resetStreak = () => {
    const newData: StreakData = {
      ...streakData,
      currentStreak: 0,
      lastActivityDate: ''
    };
    saveStreakData(newData);
  };

  const exportBadge = (badge: Badge) => {
    // Create a canvas to generate badge image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Badge content
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(badge.symbol, 400, 200);
    
    ctx.font = 'bold 36px Arial';
    ctx.fillText(badge.name, 400, 280);
    
    ctx.font = '24px Arial';
    ctx.fillText(`${streakData.currentStreak} Day Streak`, 400, 320);
    
    ctx.font = '20px Arial';
    const words = badge.description.split(' ');
    let line = '';
    let y = 380;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > 600 && n > 0) {
        ctx.fillText(line, 400, y);
        line = words[n] + ' ';
        y += 30;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 400, y);

    // Download the image
    const link = document.createElement('a');
    link.download = `${badge.name.replace(/\s+/g, '_')}_Badge.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <StreakContext.Provider value={{
      streakData,
      addActivity,
      getNextBadge,
      showBadgeUnlock,
      newlyUnlockedBadge,
      dismissBadgeUnlock,
      resetStreak,
      exportBadge
    }}>
      {children}
    </StreakContext.Provider>
  );
};