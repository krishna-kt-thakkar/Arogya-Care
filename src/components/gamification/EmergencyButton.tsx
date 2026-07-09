import React from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';

const EmergencyButton: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleEmergencyClick = () => {
    navigate('/emergency-contacts');
  };

  return (
    <motion.button
      onClick={handleEmergencyClick}
      className="fixed bottom-20 left-4 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg z-50"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{ 
        boxShadow: [
          "0 0 0 0 rgba(239, 68, 68, 0.7)",
          "0 0 0 10px rgba(239, 68, 68, 0)",
          "0 0 0 0 rgba(239, 68, 68, 0)"
        ]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity,
        repeatType: "loop"
      }}
    >
      <Phone className="h-6 w-6" />
      <span className="sr-only">{t('emergency')}</span>
    </motion.button>
  );
};

export default EmergencyButton;