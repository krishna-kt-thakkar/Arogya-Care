import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Target, Download, Sparkles, Zap, Shield, Activity, Award, TrendingUp } from 'lucide-react';
import { useStreak } from '../../contexts/StreakContext';

const getBadgeIcon = (id: string) => {
  switch (id) {
    case 'spark': return Sparkles;
    case 'warrior': return Zap;
    case 'centurion': return Shield;
    case 'iron': return Activity;
    case 'titan': return Trophy;
    case 'eternal': return Flame;
    case 'immortal': return Award;
    case 'infinite': return TrendingUp;
    case 'legacy': return Trophy;
    default: return Trophy;
  }
};

interface StreakDisplayProps {
  compact?: boolean;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ compact = false }) => {
  const { streakData, getNextBadge } = useStreak();
  const nextBadge = getNextBadge();
  const unlockedBadges = streakData.badges.filter(b => b.unlocked);

  if (compact) {
    return (
      <motion.div
        className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 rounded-2xl p-4 text-white shadow-lg transition-colors duration-300"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Flame className="h-6 w-6 text-yellow-300" />
            </motion.div>
            <div>
              <p className="font-bold text-lg">
                {streakData.currentStreak === 0 ? 'Start Your Journey' : `Day ${streakData.currentStreak}`}
              </p>
              <p className="text-sm opacity-90">
                {streakData.currentStreak === 0 ? 'Begin your streak today!' : 'Keep the fire burning!'}
              </p>
            </div>
          </div>
          
          {unlockedBadges.length > 0 && (
            <div className="flex items-center space-x-1">
              <Trophy className="h-5 w-5 text-yellow-300" />
              <span className="font-semibold">{unlockedBadges.length}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="glass-card p-6 border border-card-custom transition-colors duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Current Streak */}
      <div className="text-center mb-6">
        <motion.div
          className="flex items-center justify-center mb-4"
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="bg-gradient-to-r from-orange-400 to-red-500 dark:from-orange-500 dark:to-red-600 rounded-full p-4 shadow-lg transition-colors duration-300">
            <Flame className="h-8 w-8 text-white" />
          </div>
        </motion.div>
        
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-300">
          {streakData.currentStreak === 0 ? 'Ready to Start?' : `Day ${streakData.currentStreak}`}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
          {streakData.currentStreak === 0 
            ? 'Begin your journey to greatness today!'
            : 'of your incredible journey'
          }
        </p>
        
        {streakData.longestStreak > streakData.currentStreak && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">
            Personal best: {streakData.longestStreak} days
          </p>
        )}
      </div>

      {/* Next Badge Progress */}
      {nextBadge && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
              <span className="font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">Next Badge</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
              {streakData.currentStreak}/{nextBadge.daysRequired} days
            </span>
          </div>
          
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3 transition-colors duration-300">
            <motion.div
              className="bg-gradient-to-r from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 h-3 rounded-full transition-colors duration-300"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((streakData.currentStreak / nextBadge.daysRequired) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl transition-colors duration-300">
            {(() => {
              const IconComp = getBadgeIcon(nextBadge.id);
              return <IconComp className={`h-6 w-6 ${nextBadge.color}`} />;
            })()}
            <div>
              <p className="font-semibold text-purple-800 dark:text-purple-300 transition-colors duration-300">{nextBadge.name}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400 transition-colors duration-300">
                {nextBadge.daysRequired - streakData.currentStreak} days to go!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Badges */}
      {unlockedBadges.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400 transition-colors duration-300" />
            <span className="font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">Your Achievements</span>
            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300">
              {unlockedBadges.length}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {unlockedBadges.slice(-3).map((badge) => (
              <motion.div
                key={badge.id}
                className={`flex items-center space-x-2 p-2 ${badge.bgColor} rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-300`}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {(() => {
                  const IconComp = getBadgeIcon(badge.id);
                  return <IconComp className={`h-4 w-4 ${badge.color}`} />;
                })()}
                <span className={`text-sm font-medium ${badge.color} transition-colors duration-300`}>
                  {badge.name}
                </span>
              </motion.div>
            ))}
            
            {unlockedBadges.length > 3 && (
              <div className="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-300">
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium transition-colors duration-300">
                  +{unlockedBadges.length - 3} more
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StreakDisplay;