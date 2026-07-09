import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  fullScreen = false, 
  message = 'Loading...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Outer spinning ring */}
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-4 border-teal-100 dark:border-teal-900/30 border-t-teal-500 dark:border-t-teal-400`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {/* Center icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Heart className={`${iconSizes[size]} text-teal-500 dark:text-teal-400`} />
        </motion.div>
      </div>
      {message && (
        <motion.p
          className="text-sm font-medium text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
