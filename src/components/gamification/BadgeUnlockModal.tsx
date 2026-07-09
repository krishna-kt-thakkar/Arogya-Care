import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Download, Share, X, Sparkles } from 'lucide-react';
import { useStreak } from '../../contexts/StreakContext';

const BadgeUnlockModal: React.FC = () => {
  const { showBadgeUnlock, newlyUnlockedBadge, dismissBadgeUnlock, exportBadge, streakData } = useStreak();

  if (!showBadgeUnlock || !newlyUnlockedBadge) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `I unlocked the ${newlyUnlockedBadge.name} badge!`,
        text: `🎉 Just achieved a ${streakData.currentStreak}-day streak and unlocked the ${newlyUnlockedBadge.symbol} ${newlyUnlockedBadge.name} badge in Arogya Care! ${newlyUnlockedBadge.description}`,
        url: window.location.origin
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = `🎉 Just achieved a ${streakData.currentStreak}-day streak and unlocked the ${newlyUnlockedBadge.symbol} ${newlyUnlockedBadge.name} badge in Arogya Care! ${newlyUnlockedBadge.description}`;
      navigator.clipboard.writeText(text);
      alert('Achievement copied to clipboard!');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden transition-colors duration-300"
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 15, stiffness: 300 }}
        >
          {/* Background Animation */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-70"
                initial={{ 
                  x: Math.random() * 400, 
                  y: Math.random() * 600,
                  scale: 0 
                }}
                animate={{ 
                  y: -100,
                  scale: [0, 1, 0],
                  rotate: 360
                }}
                transition={{ 
                  duration: 3,
                  delay: i * 0.1,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={dismissBadgeUnlock}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 z-10"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Content */}
          <div className="text-center relative z-10">
            {/* Celebration Header */}
            <motion.div
              className="mb-6"
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
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center shadow-lg">
                <Trophy className="h-10 w-10 text-white" />
              </div>
            </motion.div>

            <motion.h2
              className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              🎉 Congratulations!
            </motion.h2>

            {/* Badge Display */}
            <motion.div
              className={`inline-flex items-center space-x-3 p-6 ${newlyUnlockedBadge.bgColor} rounded-2xl border-2 border-yellow-300 dark:border-yellow-600 shadow-lg mb-6 ${newlyUnlockedBadge.aura} transition-colors duration-300`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", damping: 10 }}
            >
              <motion.span 
                className="text-4xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {newlyUnlockedBadge.symbol}
              </motion.span>
              <div className="text-left">
                <h3 className={`text-xl font-bold ${newlyUnlockedBadge.color} transition-colors duration-300`}>
                  {newlyUnlockedBadge.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Day {streakData.currentStreak} Achievement</p>
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 italic transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              "{newlyUnlockedBadge.description}"
            </motion.p>

            {/* Next Badge Preview */}
            <motion.div
              className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 mb-6 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                <span className="text-sm font-medium text-purple-800 dark:text-purple-300 transition-colors duration-300">What's Next?</span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-400 transition-colors duration-300">
                Keep going to unlock even greater achievements! 
                Your dedication is building something extraordinary.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex space-x-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <button
                onClick={handleShare}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Share className="h-5 w-5" />
                <span>Share</span>
              </button>
              
              <button
                onClick={() => exportBadge(newlyUnlockedBadge)}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Download</span>
              </button>
            </motion.div>

            <motion.button
              onClick={dismissBadgeUnlock}
              className="w-full mt-4 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-300 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              Continue Journey →
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BadgeUnlockModal;