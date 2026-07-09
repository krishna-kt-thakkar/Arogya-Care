import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon, ChevronRight } from 'lucide-react';

interface HealthCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  onClick?: () => void;
  delay?: number;
}

const HealthCard: React.FC<HealthCardProps> = ({
  title,
  description,
  icon: Icon,
  color,
  bgColor,
  onClick,
  delay = 0
}) => {
  return (
    <motion.div
      className="glass-card p-6 border border-card-custom hover:border-brand-from hover:shadow-active cursor-pointer group transition-all duration-300 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      {/* Dynamic glow effect in top corner */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-brand-from/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      
      <div className="relative flex items-start space-x-4">
        <motion.div
          className={`p-3 rounded-xl bg-brand-gradient/10 border border-brand-from/20 text-brand-from group-hover:bg-brand-gradient/20 transition-all duration-300 shadow-sm`}
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.4 }}
        >
          <Icon className="h-6 w-6" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-primary-custom mb-1 truncate group-hover:text-brand-from transition-colors">
            {title}
          </h3>
          <p className="text-sm text-secondary-custom leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-secondary-custom/50 group-hover:text-brand-from transition-all duration-300 group-hover:translate-x-1 mt-1 flex-shrink-0" />
      </div>
    </motion.div>
  );
};

export default HealthCard;