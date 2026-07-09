import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, User, Loader2, AlertCircle, ExternalLink, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const SYSTEM_PROMPT = `You are AROGYA CARE Health Assistant, a friendly and knowledgeable wellness companion. You help users with:
- General health and wellness advice
- Hydration, sleep hygiene, and nutrition tips
- Fitness and exercise guidance
- Stress management and mental wellness
- Understanding basic health metrics (BMI, heart rate, blood pressure)

IMPORTANT RULES:
1. Always be warm, encouraging, and supportive
2. For ANY symptom-specific question, medical diagnosis, or urgent health concern, clearly state: "I'm not a doctor. Please consult a healthcare professional for this."
3. Never prescribe medications or dosages
4. Keep responses concise (2-3 paragraphs max)
5. Use simple, everyday language
6. If asked about your capabilities, mention that users can also visit the full AI Assistant page for deeper conversations`;

const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hey there! 👋 I\'m your AROGYA CARE wellness assistant. Ask me anything about health, fitness, nutrition, or wellness tips!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_DEEPSEEK_API_KEY;
      
      if (!apiKey || apiKey.includes('your_')) {
        // Fallback when no API key is configured
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '🔧 The AI service is not configured yet. Please add your API key to the `.env` file to enable real AI responses.\n\nIn the meantime, you can visit the full **AI Assistant** page or **AI Mood Companion** for more features!',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, fallbackMessage]);
        setIsLoading(false);
        return;
      }

      const isDeepSeek = !import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_DEEPSEEK_API_KEY;
      const apiUrl = isDeepSeek
        ? 'https://api.deepseek.com/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
      const model = isDeepSeek ? 'deepseek-chat' : 'gpt-3.5-turbo';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.filter(m => m.role !== 'system').slice(-10).map(m => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: trimmed },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiContent = data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t generate a response. Please try again.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError('Couldn\'t reach the AI service. Check your connection and try again.');
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed bottom-20 right-4 z-[60] w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/20 rounded-full">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AROGYA CARE AI</h3>
                <p className="text-xs text-white/70">Wellness Assistant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Disclaimer */}
          <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800 flex items-center space-x-2">
            <Shield className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
            <p className="text-[10px] text-amber-700 dark:text-amber-300">
              Not medical advice. Consult a doctor for health concerns.
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3 flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 text-teal-500 animate-spin" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Deep-link bar */}
          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex space-x-2">
            <button
              onClick={() => { onClose(); navigate('/ai-assistant'); }}
              className="flex-1 text-[10px] font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg py-1.5 flex items-center justify-center space-x-1 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Full Health Assistant</span>
            </button>
            <button
              onClick={() => { onClose(); navigate('/ai-mood-companion'); }}
              className="flex-1 text-[10px] font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg py-1.5 flex items-center justify-center space-x-1 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Mood Companion</span>
            </button>
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about health & wellness..."
                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                disabled={isLoading}
              />
              <motion.button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
                whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatWidget;
