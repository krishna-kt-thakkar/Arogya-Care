import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ExternalLink, Globe, Zap, Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LiveDeploymentPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-400 rounded-full opacity-30"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: 0 
            }}
            animate={{ 
              y: [null, -100, -200],
              scale: [0, 1, 0],
              rotate: 360
            }}
            transition={{ 
              duration: 4,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 max-w-2xl w-full text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Success Icon */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: 0.6, 
            delay: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
        >
          <div className="relative mx-auto w-24 h-24">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-2xl"
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 10px 30px rgba(34, 197, 94, 0.3)",
                  "0 20px 60px rgba(34, 197, 94, 0.5)",
                  "0 10px 30px rgba(34, 197, 94, 0.3)"
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="relative z-10 w-full h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          App Successfully Deployed!
        </motion.h1>

        {/* Deployment Card */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {/* Live URL Section */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Globe className="h-6 w-6 text-teal-600 dark:text-teal-400 mr-3" />
              </motion.div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                This app is now live at:
              </h2>
            </div>
            
            <motion.div
              className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-teal-200 dark:border-teal-700"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-center space-x-3">
                <motion.a
                  href="https://your-custom-domain.ionos.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>https://your-custom-domain.ionos.space</span>
                  <ExternalLink className="h-5 w-5" />
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* IONOS Credit */}
          <motion.div
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-700 mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="text-blue-800 dark:text-blue-300 font-medium">
                Custom domain provided by IONOS via Entri challenge.
              </p>
            </div>
          </motion.div>

          {/* Features Highlight */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Zap className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800 dark:text-green-300 text-sm">Lightning Fast</h3>
              <p className="text-green-600 dark:text-green-400 text-xs">Optimized performance</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <Heart className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-800 dark:text-purple-300 text-sm">Health Focused</h3>
              <p className="text-purple-600 dark:text-purple-400 text-xs">Complete wellness platform</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Global Access</h3>
              <p className="text-blue-600 dark:text-blue-400 text-xs">Available worldwide</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
          >
            <motion.a
              href="https://your-custom-domain.ionos.space"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink className="h-5 w-5" />
              <span>Visit Live Site</span>
            </motion.a>
            
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue to Dashboard
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-gray-700/20 flex items-center justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              Built with <Heart className="h-3 w-3 text-red-500 fill-red-500 mx-1" /> using{' '}
              <motion.span
                className="font-semibold text-orange-600 dark:text-orange-400 mx-1"
                whileHover={{ scale: 1.05 }}
              >
                Bolt.new
              </motion.span>
              {' '}and deployed via{' '}
              <motion.span
                className="font-semibold text-blue-600 dark:text-blue-400 ml-1"
                whileHover={{ scale: 1.05 }}
              >
                IONOS Hosting
              </motion.span>
            </p>
          </div>
        </motion.div>

        {/* Floating Success Elements */}
        <div className="absolute top-10 left-10">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Zap className="h-8 w-8 text-yellow-400 opacity-60" />
          </motion.div>
        </div>

        <div className="absolute top-20 right-10">
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            <Sparkles className="h-8 w-8 text-teal-400 opacity-60" />
          </motion.div>
        </div>

        <div className="absolute bottom-20 left-20">
          <motion.div
            animate={{ 
              y: [0, -8, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <Globe className="h-8 w-8 text-blue-400 opacity-60" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveDeploymentPage;