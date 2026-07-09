import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Stethoscope,
  Heart,
  Activity,
  Thermometer,
  Pill,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  type?: 'text' | 'health-tip' | 'reminder' | 'analysis';
}

interface HealthContext {
  recentSymptoms: string[];
  medications: string[];
  vitalSigns: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
  };
  concerns: string[];
}

const AIAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [healthContext, setHealthContext] = useState<HealthContext>({
    recentSymptoms: [],
    medications: [],
    vitalSigns: {},
    concerns: []
  });
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Auto-scroll to bottom
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
    addAssistantMessage("Hello! I'm your AI Health Assistant. I'm here to help you with medical questions, track your health, and provide personalized wellness advice. How can I assist you today?");
  }, []);

  // Add user message
  const addUserMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, message]);
  };

  // Add assistant message
  const addAssistantMessage = (text: string, type: Message['type'] = 'text') => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isUser: false,
      timestamp: Date.now(),
      type
    };

    setMessages(prev => [...prev, message]);

    // Text-to-speech
    if (!isMuted && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Try to find a professional-sounding voice
      const voices = speechSynthesis.getVoices();
      const professionalVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('google') ||
        voice.name.toLowerCase().includes('microsoft') ||
        voice.name.toLowerCase().includes('alex') ||
        voice.name.toLowerCase().includes('daniel')
      );
      
      if (professionalVoice) {
        utterance.voice = professionalVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  // Get AI response (mock implementation)
  const getAIResponse = async (userMessage: string): Promise<{ text: string; type: Message['type'] }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const message = userMessage.toLowerCase();
    
    // Health-specific responses
    if (message.includes('headache') || message.includes('head pain')) {
      return {
        text: "I understand you're experiencing a headache. This could be due to various factors like stress, dehydration, lack of sleep, or eye strain. Here are some immediate steps you can try:\n\n• Stay hydrated - drink water\n• Rest in a quiet, dark room\n• Apply a cold or warm compress\n• Practice gentle neck stretches\n\nIf headaches persist, are severe, or accompanied by other symptoms like fever, vision changes, or neck stiffness, please consult a healthcare provider immediately.",
        type: 'health-tip'
      };
    }
    
    if (message.includes('blood pressure') || message.includes('bp')) {
      return {
        text: "Blood pressure monitoring is crucial for cardiovascular health. Normal blood pressure is typically below 120/80 mmHg. Here's what you should know:\n\n• Systolic (top number): Pressure when heart beats\n• Diastolic (bottom number): Pressure when heart rests\n\nFactors affecting BP:\n• Diet (especially sodium intake)\n• Exercise and physical activity\n• Stress levels\n• Sleep quality\n• Medications\n\nWould you like me to help you track your blood pressure readings?",
        type: 'analysis'
      };
    }
    
    if (message.includes('medication') || message.includes('medicine') || message.includes('pills')) {
      return {
        text: "Medication management is essential for your health. Here are some important reminders:\n\n• Take medications as prescribed by your doctor\n• Never skip doses without consulting your healthcare provider\n• Set up reminders to maintain consistency\n• Keep a list of all medications and dosages\n• Be aware of potential side effects\n• Store medications properly\n\nI can help you set up medication reminders in the app. Would you like me to guide you through that?",
        type: 'reminder'
      };
    }
    
    if (message.includes('sleep') || message.includes('tired') || message.includes('insomnia')) {
      return {
        text: "Good sleep is fundamental to your health. Adults typically need 7-9 hours of quality sleep. Here are some tips for better sleep:\n\n• Maintain a consistent sleep schedule\n• Create a relaxing bedtime routine\n• Keep your bedroom cool, dark, and quiet\n• Avoid screens 1 hour before bed\n• Limit caffeine after 2 PM\n• Exercise regularly, but not close to bedtime\n\nPoor sleep can affect your immune system, mood, and cognitive function. If you're having persistent sleep issues, consider consulting a sleep specialist.",
        type: 'health-tip'
      };
    }
    
    if (message.includes('exercise') || message.includes('workout') || message.includes('fitness')) {
      return {
        text: "Regular exercise is one of the best things you can do for your health! The CDC recommends:\n\n• 150 minutes of moderate aerobic activity per week\n• 2 days of muscle-strengthening activities\n• Balance and flexibility exercises\n\nBenefits include:\n• Improved cardiovascular health\n• Better mood and mental health\n• Stronger bones and muscles\n• Better sleep quality\n• Reduced risk of chronic diseases\n\nStart slowly if you're new to exercise, and gradually increase intensity. Always consult your doctor before starting a new exercise program.",
        type: 'health-tip'
      };
    }
    
    if (message.includes('diet') || message.includes('nutrition') || message.includes('food')) {
      return {
        text: "Nutrition plays a vital role in your overall health. Here are key principles for a healthy diet:\n\n• Eat a variety of colorful fruits and vegetables\n• Choose whole grains over refined grains\n• Include lean proteins (fish, poultry, legumes)\n• Limit processed foods and added sugars\n• Stay hydrated with plenty of water\n• Practice portion control\n\nA balanced diet can help prevent chronic diseases, maintain a healthy weight, and boost your energy levels. Consider consulting a registered dietitian for personalized advice.",
        type: 'health-tip'
      };
    }
    
    if (message.includes('stress') || message.includes('anxiety') || message.includes('worried')) {
      return {
        text: "Stress and anxiety are common, but manageable. Here are some evidence-based strategies:\n\n• Deep breathing exercises (4-7-8 technique)\n• Regular physical activity\n• Mindfulness and meditation\n• Adequate sleep (7-9 hours)\n• Social support and connection\n• Time management and prioritization\n• Professional counseling when needed\n\nChronic stress can impact your physical health, so it's important to develop healthy coping mechanisms. If anxiety is interfering with daily life, please consider speaking with a mental health professional.",
        type: 'health-tip'
      };
    }
    
    // General health responses
    const responses = [
      {
        text: "I'm here to help with your health questions. Could you provide more specific details about what you're experiencing? This will help me give you more targeted advice.",
        type: 'text' as const
      },
      {
        text: "That's a great health-related question! Based on current medical guidelines, I'd recommend discussing this with your healthcare provider for personalized advice. In the meantime, I can share some general information that might be helpful.",
        type: 'text' as const
      },
      {
        text: "Your health is important, and I'm glad you're being proactive about it. Let me provide some evidence-based information that might help, but remember that this doesn't replace professional medical advice.",
        type: 'text' as const
      }
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    
    // Add user message
    addUserMessage(userMessage);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      const response = await getAIResponse(userMessage);
      addAssistantMessage(response.text, response.type);
    } catch (error) {
      addAssistantMessage("I apologize, but I'm having trouble processing your request right now. Please try again, or if this is urgent, consider contacting your healthcare provider directly.");
    } finally {
      setIsTyping(false);
    }
  };

  // Handle voice input
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
      handleSendMessage();
    }
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([]);
    addAssistantMessage("Hello! I'm your AI Health Assistant. How can I help you with your health today?");
  };

  // Get message icon
  const getMessageIcon = (type: Message['type']) => {
    switch (type) {
      case 'health-tip': return <Heart className="h-4 w-4 text-green-500" />;
      case 'reminder': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'analysis': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default: return <Bot className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
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
              className="mr-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center space-x-3">
                <Stethoscope className="h-8 w-8 text-blue-500" />
                <span>AI Health Assistant</span>
                <Bot className="h-6 w-6 text-blue-500" />
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Your personal medical AI companion</p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full transition-all ${
                isMuted 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              }`}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            
            <button
              onClick={clearConversation}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 h-[600px] flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Dr. AI Assistant</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Medical AI • Always Available</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Online</span>
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
                  {!message.isUser && (
                    <div className="flex items-center space-x-2 mb-2">
                      {getMessageIcon(message.type)}
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {message.type === 'health-tip' ? 'Health Tip' :
                         message.type === 'reminder' ? 'Reminder' :
                         message.type === 'analysis' ? 'Analysis' : 'Assistant'}
                      </span>
                    </div>
                  )}
                  
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : message.type === 'health-tip'
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-gray-800 dark:text-gray-100 border border-green-200 dark:border-green-700'
                      : message.type === 'reminder'
                      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-gray-800 dark:text-gray-100 border border-blue-200 dark:border-blue-700'
                      : message.type === 'analysis'
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-gray-800 dark:text-gray-100 border border-purple-200 dark:border-purple-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-2 ${
                      message.isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                
                {!message.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center ml-3 order-1 flex-shrink-0">
                    <Stethoscope className="h-4 w-4 text-white" />
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
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <motion.div
                        className="w-2 h-2 bg-blue-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-indigo-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-blue-400 rounded-full"
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
          <div className="p-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about your health, symptoms, medications, or wellness tips..."
                  className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={2}
                />
                
                <button
                  onClick={toggleListening}
                  className={`absolute right-3 top-3 p-1 rounded-full transition-all ${
                    isListening 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>
              
              <motion.button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            { icon: Activity, label: 'Check Symptoms', message: 'I have some symptoms I\'d like to discuss' },
            { icon: Pill, label: 'Medication Help', message: 'I need help with my medications' },
            { icon: Heart, label: 'Heart Health', message: 'I want to know about heart health' },
            { icon: Thermometer, label: 'Vital Signs', message: 'Help me understand my vital signs' }
          ].map((action, index) => (
            <motion.button
              key={action.label}
              onClick={() => setCurrentMessage(action.message)}
              className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all text-center group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <action.icon className="h-8 w-8 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{action.label}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                Important Medical Disclaimer
              </h3>
              <p className="text-yellow-700 dark:text-yellow-400 text-sm leading-relaxed">
                This AI assistant provides general health information and should not replace professional medical advice, 
                diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns. 
                In case of emergency, contact emergency services immediately.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AIAssistantPage;