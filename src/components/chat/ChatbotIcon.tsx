import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import ChatWidget from './ChatWidget';

const ChatbotIcon: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full shadow-lg cursor-pointer transition-all duration-300 ${
            isOpen
              ? 'bg-white/15 hover:bg-white/20'
              : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-teal-500/30'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={isOpen ? {} : { y: [0, -5, 0] }}
          transition={isOpen ? {} : {
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        >
          {isOpen ? (
            <motion.span
              className="text-white text-xl font-bold leading-none block h-6 w-6 flex items-center justify-center"
              initial={{ rotate: 0 }}
              animate={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              ✕
            </motion.span>
          ) : (
            <MessageCircle className="h-6 w-6 text-white" />
          )}
        </motion.button>
      </motion.div>

      {/* Inline Chat Widget */}
      <ChatWidget isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatbotIcon;