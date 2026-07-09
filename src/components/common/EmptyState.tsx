import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  color?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  color = 'text-gray-400 dark:text-gray-500',
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="mb-6 p-6 rounded-full bg-gray-100 dark:bg-gray-800/50"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon className={`h-12 w-12 ${color}`} />
      </motion.div>
      
      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <motion.button
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
