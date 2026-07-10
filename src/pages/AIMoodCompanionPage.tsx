import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  Sparkles,
  Mic,
  MicOff,
  Send,
  User,
  Clock,
  RotateCcw,
  AlertCircle,
  MessageCircle,
  Smile,
  Frown,
  Meh,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useLanguage } from '../hooks/useLanguage';


interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
}

const AIMoodCompanionPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(240); // 4 minutes in seconds
  const [isMuted, setIsMuted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Add welcome message
    addCompanionMessage("Hi there! I'm your AI mood companion. I'm here to listen and chat with you for the next 4 minutes. How are you feeling today?");
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (sessionActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && sessionActive) {
      setSessionActive(false);
      setSessionComplete(true);
      addCompanionMessage("Our 4-minute session has come to an end. I hope our conversation was helpful. Remember that it's important to take time for yourself and your emotions. Feel free to start another session whenever you need someone to talk to.");
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionActive, timeRemaining]);

  // Format time remaining
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Add user message
  const addUserMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, message]);
    
    // Start session if not already active
    if (!sessionActive && !sessionComplete) {
      setSessionActive(true);
    }
  };

  // Add companion message
  const addCompanionMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isUser: false,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, message]);

    // Text-to-speech
    if (!isMuted && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Try to find a natural-sounding voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('google') && voice.name.toLowerCase().includes('us')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  // Get AI response
  const getAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    const message = userMessage.toLowerCase();
    
    // Detect mood from message
    if (message.includes('happy') || message.includes('great') || message.includes('good') || message.includes('wonderful')) {
      setCurrentMood('happy');
    } else if (message.includes('sad') || message.includes('depressed') || message.includes('unhappy') || message.includes('down')) {
      setCurrentMood('sad');
    } else if (message.includes('angry') || message.includes('frustrated') || message.includes('mad')) {
      setCurrentMood('angry');
    } else if (message.includes('anxious') || message.includes('worried') || message.includes('nervous')) {
      setCurrentMood('anxious');
    }
    
    // Empathetic responses for different emotions
    if (message.includes('happy') || message.includes('great') || message.includes('good') || message.includes('wonderful')) {
      return "I'm so glad to hear you're feeling good! Those positive moments are worth celebrating. What's been bringing you joy lately?";
    }
    
    if (message.includes('sad') || message.includes('depressed') || message.includes('unhappy') || message.includes('down')) {
      return "I hear that you're feeling down, and I want you to know that's completely okay. Everyone experiences sadness sometimes. Would you like to talk more about what's been happening?";
    }
    
    if (message.includes('angry') || message.includes('frustrated') || message.includes('mad')) {
      return "It sounds like you're feeling frustrated, and that's completely understandable. Sometimes talking about what's bothering us can help release some of that tension. Would you like to share what happened?";
    }
    
    if (message.includes('anxious') || message.includes('worried') || message.includes('nervous')) {
      return "Anxiety can feel overwhelming sometimes. I'm here to listen without judgment. Would it help to talk through what's making you feel anxious right now?";
    }
    
    if (message.includes('tired') || message.includes('exhausted') || message.includes('no energy')) {
      return "Being tired can affect us both physically and emotionally. It's important to acknowledge when we need rest. Have you been able to take some time for yourself lately?";
    }
    
    if (message.includes('lonely') || message.includes('alone')) {
      return "Feeling lonely is something many of us experience, even when we're surrounded by others. I'm here with you right now, and I'm genuinely interested in how you're doing. Would you like to talk more about these feelings?";
    }
    
    if (message.includes('thank')) {
      return "You're very welcome. I'm glad we could talk today. It takes courage to share your feelings, and I appreciate you opening up to me.";
    }
    
    if (message.includes('bye') || message.includes('goodbye') || message.includes('talk later')) {
      return "I've enjoyed our conversation. Remember that I'm here whenever you need someone to talk to. Take care of yourself, and I hope to chat with you again soon.";
    }
    
    // General responses for conversation continuity
    const generalResponses = [
      "Thank you for sharing that with me. How does talking about this make you feel?",
      "I appreciate your openness. What else has been on your mind lately?",
      "I'm here to listen. Would you like to tell me more about that?",
      "That's really insightful. How has this been affecting you day to day?",
      "I'm glad you're expressing these thoughts. Sometimes putting feelings into words can help us process them. Is there anything specific you'd like to focus on?",
      "I hear you, and what you're feeling is completely valid. Is there anything that might help you feel better right now?",
      "It takes courage to share your feelings. Is there anything else you'd like to talk about?",
      "I'm listening to everything you're saying. Would you like to explore this further?",
      "That sounds challenging. What has helped you navigate similar situations before?",
      "I'm here for you. Sometimes just having someone to listen can make a difference. Is there anything else on your mind?"
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  };

  // Send message
  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    
    // Add user message
    addUserMessage(userMessage);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      const response = await getAIResponse(userMessage);
      addCompanionMessage(response);
    } catch (error) {
      console.error('Error getting response:', error);
      addCompanionMessage("I'm having a bit of trouble processing that right now. Could we try again?");
    } finally {
      setIsTyping(false);
    }
  };

  // Toggle voice input
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Reset session
  const resetSession = () => {
    setMessages([]);
    setCurrentMood(null);
    setSessionActive(false);
    setSessionComplete(false);
    setTimeRemaining(240);
    addCompanionMessage("Let's start a new 4-minute session. How are you feeling today?");
  };

  // Get mood icon
  const getMoodIcon = () => {
    switch (currentMood) {
      case 'happy': return <Smile className="h-6 w-6 text-yellow-500" />;
      case 'sad': return <Frown className="h-6 w-6 text-blue-500" />;
      case 'angry': return <Frown className="h-6 w-6 text-red-500" />;
      case 'anxious': return <Meh className="h-6 w-6 text-purple-500" />;
      default: return <Heart className="h-6 w-6 text-pink-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-secondary-custom" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primary-custom flex items-center space-x-3">
                <Heart className="h-8 w-8 text-pink-500" />
                <span>{t('aiMoodCompanion')}</span>
                <Sparkles className="h-6 w-6 text-purple-500" />
              </h1>
              <p className="text-secondary-custom mt-1">4-minute emotional support session</p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full transition-all ${
                isMuted 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
              }`}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <button
              onClick={resetSession}
              className="p-2 rounded-full bg-white/5 text-secondary-custom hover:bg-white/10 transition-all"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* Timer Banner */}
        <motion.div
          className={`mb-4 p-4 rounded-2xl flex items-center justify-between ${
            sessionActive
              ? timeRemaining < 60
                ? 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
                : 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800'
              : sessionComplete
                ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                : 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3">
            <Clock className={`h-5 w-5 ${
              sessionActive
                ? timeRemaining < 60
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-purple-600 dark:text-purple-400'
                : sessionComplete
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-blue-600 dark:text-blue-400'
            }`} />
            <span className="font-medium text-primary-custom">
              {sessionActive
                ? `Session time remaining: ${formatTimeRemaining()}`
                : sessionComplete
                  ? 'Session complete'
                  : 'Start chatting to begin your 4-minute session'}
            </span>
          </div>
          
          {sessionActive && (
            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  timeRemaining < 60
                    ? 'bg-red-500'
                    : 'bg-purple-500'
                }`}
                initial={{ width: '100%' }}
                animate={{ width: `${(timeRemaining / 240) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          className="bg-card-surface rounded-3xl shadow-lg border border-card-custom h-[500px] flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Chat Header */}
          <div className="p-6 border-b border-card-custom">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  {getMoodIcon()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-custom">AI Companion</h3>
                  <p className="text-sm text-secondary-custom">
                    {currentMood 
                      ? `Sensing you're feeling ${currentMood}` 
                      : 'Here to listen and support'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Listening</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`max-w-xs lg:max-w-md ${message.isUser ? 'order-2' : 'order-1'}`}>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white/5 text-primary-custom'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-2 ${
                      message.isUser ? 'text-purple-100' : 'text-secondary-custom'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                
                {!message.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center ml-3 order-1 flex-shrink-0">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                )}
                
                {message.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mr-3 order-1 flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white/5 px-4 py-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <motion.div
                        className="w-2 h-2 bg-purple-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-pink-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-purple-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-card-custom">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share how you're feeling..."
                  className="w-full px-4 py-3 pr-12 border border-card-custom rounded-xl focus:ring-2 focus:ring-brand-from focus:border-transparent resize-none bg-card-surface text-primary-custom"
                  rows={2}
                  disabled={sessionComplete}
                />
                
                <button
                  onClick={toggleListening}
                  disabled={sessionComplete}
                  className={`absolute right-3 top-3 p-1 rounded-full transition-all ${
                    isListening 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' 
                      : 'bg-white/5 text-secondary-custom hover:text-secondary-custom'
                  } ${sessionComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>
              
              <motion.button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || sessionComplete}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: Smile, label: 'I feel happy today', message: 'I feel happy today' },
            { icon: Frown, label: 'I feel sad', message: 'I feel sad and could use some support' },
            { icon: MessageCircle, label: 'Just want to talk', message: 'I just want someone to talk to right now' },
            { icon: Clock, label: 'Having a tough day', message: 'I\'m having a tough day and need some encouragement' }
          ].map((action, index) => (
            <motion.button
              key={action.label}
              onClick={() => {
                setCurrentMessage(action.message);
                setTimeout(() => sendMessage(), 100);
              }}
              disabled={sessionComplete}
              className="p-4 bg-card-surface rounded-2xl border border-card-custom hover:border-purple-300 dark:hover:border-purple-600 transition-all text-center group disabled:opacity-50 disabled:cursor-not-allowed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: sessionComplete ? 1 : 1.02 }}
              whileTap={{ scale: sessionComplete ? 1 : 0.98 }}
            >
              <action.icon className="h-8 w-8 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-primary-custom">{action.label}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Session Complete Message */}
        <AnimatePresence>
          {sessionComplete && (
            <motion.div
              className="mt-8 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-start space-x-3">
                <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                    Session Complete
                  </h3>
                  <p className="text-green-700 dark:text-green-400 text-sm leading-relaxed">
                    Thank you for sharing your feelings with me today. I hope our conversation was helpful.
                    If you'd like to continue talking, you can start a new 4-minute session by clicking the reset button.
                  </p>
                  <motion.button
                    onClick={resetSession}
                    className="mt-4 bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start New Session
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <motion.div
          className="mt-8 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                Your AI Mood Companion
              </h3>
              <p className="text-purple-700 dark:text-purple-400 text-sm leading-relaxed">
                While I'm here to provide emotional support and a listening ear, I'm not a replacement for professional mental health services. 
                If you're experiencing severe distress or having thoughts of harming yourself, please contact a mental health professional 
                or emergency services immediately.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AIMoodCompanionPage;