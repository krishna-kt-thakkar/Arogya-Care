import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Trophy, 
  Calendar, 
  Target, 
  Download, 
  Share,
  Lock,
  Flame,
  Star,
  Award,
  Crown,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStreak } from '../contexts/StreakContext';
import Header from '../components/layout/Header';
import { useLanguage } from '../hooks/useLanguage';


const AchievementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { streakData, exportBadge, getNextBadge } = useStreak();
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  
  const unlockedBadges = streakData.badges.filter(b => b.unlocked);
  const lockedBadges = streakData.badges.filter(b => !b.unlocked);
  const nextBadge = getNextBadge();

  const handleShare = (badge: any) => {
    if (navigator.share) {
      navigator.share({
        title: `I unlocked the ${badge.name} badge!`,
        text: `Just achieved the ${badge.name} badge in Arogya Care! ${badge.description}`,
        url: window.location.origin
      });
    } else {
      const text = `Just achieved the ${badge.name} badge in Arogya Care! ${badge.description}`;
      navigator.clipboard.writeText(text);
      alert('Achievement copied to clipboard!');
    }
  };

  const getBadgeIcon = (badgeId: string) => {
    switch (badgeId) {
      case 'spark': return Star;
      case 'warrior': return Zap;
      case 'centurion': return Award;
      case 'iron': return Target;
      case 'titan': return Crown;
      case 'eternal': return Flame;
      case 'immortal': return Trophy;
      case 'infinite': return Target;
      case 'legacy': return Crown;
      default: return Trophy;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-6 w-6 text-secondary-custom" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-primary-custom">Your Achievements</h1>
            <p className="text-sm text-secondary-custom mt-1">Celebrate your incredible journey of consistency</p>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 text-white shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Current Streak</p>
                <p className="text-3xl font-bold">{streakData.currentStreak}</p>
                <p className="text-orange-100 text-sm">days</p>
              </div>
              <Flame className="h-8 w-8 text-orange-200" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Longest Streak</p>
                <p className="text-3xl font-bold">{streakData.longestStreak}</p>
                <p className="text-purple-100 text-sm">days</p>
              </div>
              <Target className="h-8 w-8 text-purple-200" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Active Days</p>
                <p className="text-3xl font-bold">{streakData.totalActiveDays}</p>
                <p className="text-green-100 text-sm">days</p>
              </div>
              <Calendar className="h-8 w-8 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-6 text-white shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Badges Earned</p>
                <p className="text-3xl font-bold">{unlockedBadges.length}</p>
                <p className="text-yellow-100 text-sm">of {streakData.badges.length}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-200" />
            </div>
          </motion.div>
        </div>

        {/* Next Badge Progress */}
        {nextBadge && (
          <motion.div
            className="bg-card-surface rounded-3xl p-8 shadow-lg border border-card-custom mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center mb-6">
              <Target className="h-8 w-8 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-primary-custom">Next Achievement</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-primary-custom">Progress to {nextBadge.name}</span>
                  <span className="text-sm text-secondary-custom">
                    {streakData.currentStreak}/{nextBadge.daysRequired} days
                  </span>
                </div>
                
                <div className="bg-white/10 rounded-full h-4 mb-4">
                  <motion.div
                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-4 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((streakData.currentStreak / nextBadge.daysRequired) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                
                <p className="text-secondary-custom">
                  Only <span className="font-bold text-purple-600">
                    {nextBadge.daysRequired - streakData.currentStreak}
                  </span> more days to unlock this achievement!
                </p>
              </div>
              
              <div className="flex items-center justify-center">
                <div className={`p-6 ${nextBadge.bgColor} rounded-2xl border-2 border-dashed border-purple-300`}>
                  <div className="text-center">
                    {(() => {
                      const NextIcon = getBadgeIcon(nextBadge.id);
                      return <NextIcon className="h-10 w-10 text-purple-600 mx-auto mb-2" />;
                    })()}
                    <p className={`font-bold ${nextBadge.color}`}>{nextBadge.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Unlocked Badges */}
        {unlockedBadges.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center mb-6">
              <Trophy className="h-8 w-8 text-yellow-600 mr-3" />
              <h2 className="text-2xl font-bold text-primary-custom">Earned Badges</h2>
              <span className="ml-3 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {unlockedBadges.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unlockedBadges.map((badge, index) => {
                const IconComponent = getBadgeIcon(badge.id);
                return (
                  <motion.div
                    key={badge.id}
                    className={`bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom cursor-pointer hover:shadow-xl transition-all ${badge.aura}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 ${badge.bgColor} rounded-full mb-4 shadow-lg`}>
                        <IconComponent className="h-8 w-8 text-yellow-600" />
                      </div>
                      
                      <h3 className={`text-lg font-bold ${badge.color} mb-2`}>
                        {badge.name}
                      </h3>
                      
                      <p className="text-sm text-secondary-custom mb-4 leading-relaxed">
                        {badge.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-secondary-custom">
                        <span>Day {badge.daysRequired}</span>
                        {badge.unlockedDate && (
                          <span>
                            {new Date(badge.unlockedDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(badge);
                          }}
                          className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-xl text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Share className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportBadge(badge);
                          }}
                          className="flex-1 bg-green-100 text-green-600 py-2 rounded-xl text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Download className="h-4 w-4" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center mb-6">
              <Lock className="h-8 w-8 text-secondary-custom mr-3" />
              <h2 className="text-2xl font-bold text-primary-custom">Future Achievements</h2>
              <span className="ml-3 bg-white/5 text-secondary-custom px-3 py-1 rounded-full text-sm font-medium">
                {lockedBadges.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  className="bg-white/5 rounded-3xl p-6 shadow-lg border border-card-custom opacity-75"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 0.75, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                      <Lock className="h-6 w-6 text-secondary-custom" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-secondary-custom mb-2">
                      {badge.name}
                    </h3>
                    
                    <p className="text-sm text-secondary-custom mb-4">
                      Unlock at {badge.daysRequired} days
                    </p>
                    
                    <div className="bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-white/20 h-2 rounded-full"
                        style={{ width: `${Math.min((streakData.currentStreak / badge.daysRequired) * 100, 100)}%` }}
                      />
                    </div>
                    
                    <p className="text-xs text-secondary-custom mt-2">
                      {badge.daysRequired - streakData.currentStreak} days to go
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Badge Detail Modal */}
        <AnimatePresence>
          {selectedBadge && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
            >
              <motion.div
                className="bg-card-surface rounded-3xl p-8 max-w-md w-full shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 ${selectedBadge.bgColor} rounded-full mb-6 shadow-lg ${selectedBadge.aura}`}>
                    {(() => {
                      const IconComp = getBadgeIcon(selectedBadge.id);
                      return <IconComp className={`h-10 w-10 ${selectedBadge.color}`} />;
                    })()}
                  </div>
                  
                  <h3 className={`text-2xl font-bold ${selectedBadge.color} mb-4`}>
                    {selectedBadge.name}
                  </h3>
                  
                  <p className="text-secondary-custom leading-relaxed mb-6 italic">
                    "{selectedBadge.description}"
                  </p>
                  
                  <div className="bg-white/5 rounded-xl p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-secondary-custom">Achievement Day</p>
                        <p className="font-semibold">{selectedBadge.daysRequired}</p>
                      </div>
                      <div>
                        <p className="text-secondary-custom">Unlocked On</p>
                        <p className="font-semibold">
                          {selectedBadge.unlockedDate 
                            ? new Date(selectedBadge.unlockedDate).toLocaleDateString()
                            : 'Not yet'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleShare(selectedBadge)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                    >
                      <Share className="h-5 w-5" />
                      <span>Share</span>
                    </button>
                    
                    <button
                      onClick={() => exportBadge(selectedBadge)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setSelectedBadge(null)}
                    className="w-full mt-4 py-3 text-secondary-custom hover:text-primary-custom transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AchievementsPage;