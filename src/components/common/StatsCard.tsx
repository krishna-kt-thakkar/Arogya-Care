import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  delay?: number;
  suffix?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  delay = 0,
  suffix
}) => {
  return (
    <motion.div
      className="glass-card p-6 border border-card-custom hover:border-brand-from transition-all duration-300 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Subtle glow behind icon */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-from/10 rounded-full blur-xl" />
      
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-secondary-custom text-sm font-semibold mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-1">
            <motion.p
              className="text-3xl font-extrabold text-brand-color tracking-tight"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: delay + 0.2 }}
            >
              {value}
            </motion.p>
            {suffix && (
              <span className="text-xs font-semibold text-secondary-custom">
                {suffix}
              </span>
            )}
          </div>
        </div>
        <motion.div
          className="p-3.5 rounded-xl bg-brand-gradient/10 border border-brand-from/20 text-brand-from shadow-sm transition-all duration-300"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Icon className="h-6 w-6" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatsCard;