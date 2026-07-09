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
      className="glass-card p-5 border border-card-custom hover:border-white/20 cursor-pointer group transition-all duration-300 relative overflow-hidden"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.04, y: -6 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
    >
      {/* Ambient colored glow behind card on hover */}
      <motion.div 
        className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ background: bgColor }}
        initial={{ opacity: 0.1, scale: 0.8 }}
        whileHover={{ opacity: 0.35, scale: 1.3 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Bottom glow accent */}
      <div 
        className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-5 group-hover:opacity-20 transition-all duration-700 pointer-events-none"
        style={{ background: bgColor }}
      />

      <div className="relative flex items-start space-x-4">
        {/* 3D Layered Icon Container */}
        <div className="icon-3d-box flex-shrink-0">
          {/* Layer 3: Deep background blur glow */}
          <div 
            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} blur-lg opacity-40 group-hover:opacity-70 group-hover:blur-xl transition-all duration-500 scale-110`}
          />
          
          {/* Layer 2: Mid shadow with slight offset for depth */}
          <div 
            className={`absolute inset-0 rounded-xl bg-gradient-to-br ${color} opacity-60 translate-y-1 blur-sm group-hover:translate-y-2 transition-all duration-400`}
          />

          {/* Layer 1: Main glossy icon face */}
          <motion.div 
            className={`relative z-10 p-3.5 rounded-xl bg-gradient-to-br ${color} shadow-lg`}
            style={{
              boxShadow: `inset 0 1px 2px rgba(255,255,255,0.35), inset 0 -1px 3px rgba(0,0,0,0.15), 0 8px 20px -4px ${bgColor}`,
            }}
            whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {/* Glass reflection shine */}
            <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-xl bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
            
            <Icon className="h-6 w-6 text-white relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
          </motion.div>
        </div>

        {/* Card content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="text-[15px] font-bold text-primary-custom mb-1 truncate group-hover:text-brand-from transition-colors duration-300">
            {title}
          </h3>
          <p className="text-xs text-secondary-custom leading-relaxed line-clamp-2 group-hover:text-secondary-custom/80 transition-colors">
            {description}
          </p>
        </div>

        {/* Animated arrow */}
        <motion.div
          className="mt-1 flex-shrink-0"
          initial={{ x: 0, opacity: 0.4 }}
          whileHover={{ x: 4, opacity: 1 }}
        >
          <ChevronRight className="h-5 w-5 text-secondary-custom/40 group-hover:text-brand-from transition-all duration-300 group-hover:translate-x-1" />
        </motion.div>
      </div>

      {/* Bottom subtle gradient line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${bgColor}, transparent)` }}
      />
    </motion.div>
  );
};

export default HealthCard;