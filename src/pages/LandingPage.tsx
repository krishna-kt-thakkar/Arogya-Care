import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Heart, Droplets, Moon, Footprints, Pill, Brain, Scale,
  Shield, Sparkles, ArrowRight, ChevronDown,
  Trophy, Activity, Bot, MapPin, FileText, CheckCircle,
  Palette, Users, TrendingUp, Clock,
  Mail, Lock, User, Eye, EyeOff, AlertCircle, Chrome,
  KeyRound, Send, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { hasFirebaseConfig } from '../backend/firebase';

type AuthMode = 'login' | 'signup' | 'signup-verify' | 'otp-send' | 'otp-verify' | 'forgot' | 'email-sent';

// Scroll-animated section wrapper
const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
};

// Feature card
const FeatureCard: React.FC<{
  icon: any; title: string; description: string;
  gradient: string; glow: string; delay: number;
}> = ({ icon: Icon, title, description, gradient, glow, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref}
      className="group relative bg-white/[0.06] dark:bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] dark:border-white/[0.05] rounded-3xl p-7 hover:bg-white/[0.1] transition-all duration-500 cursor-default overflow-hidden"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}>
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 ${glow}`} />
      <div className={`inline-flex p-3.5 rounded-2xl mb-5 bg-gradient-to-br ${gradient} shadow-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-blue-200/60 leading-relaxed">{description}</p>
    </motion.div>
  );
};

// Stat counter card
const StatCard: React.FC<{ value: string; label: string; delay: number }> = ({ value, label, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} className="text-center"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, type: 'spring' }}>
      <p className="text-4xl sm:text-5xl font-black text-white mb-1 tracking-tight">{value}</p>
      <p className="text-sm text-blue-200/50 font-medium">{label}</p>
    </motion.div>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme, setTheme } = useTheme();
  const { user, isLoading, login, signup, signInWithGoogle, sendOtp, verifyOtp, resetPassword, continueAsGuest } = useAuth();

  // Read initial auth mode from URL search params (for browser back button support)
  const urlMode = searchParams.get('mode') as AuthMode | null;
  const validModes: AuthMode[] = ['login', 'signup', 'signup-verify', 'otp-send', 'otp-verify', 'forgot', 'email-sent'];
  const initialMode: AuthMode = (urlMode && validModes.includes(urlMode)) ? urlMode : 'login';

  // Auth portal state
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [signupOtpCode, setSignupOtpCode] = useState(['', '', '', '', '', '']);
  const signupOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Google Account Selector Mock States
  const [showGoogleMockModal, setShowGoogleMockModal] = useState(false);
  const [mockGoogleEmail, setMockGoogleEmail] = useState('');
  const [mockGoogleOtp, setMockGoogleOtp] = useState(['', '', '', '', '', '']);
  const [mockGoogleStep, setMockGoogleStep] = useState<'select' | 'otp'>('select');
  const [customMockEmail, setCustomMockEmail] = useState('');
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false);
  const [mockGoogleError, setMockGoogleError] = useState('');
  const mockGoogleOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Centralized navigation: whenever user becomes truthy, route appropriately
  useEffect(() => {
    if (user && !isLoading) {
      const hasSeenWelcome = localStorage.getItem('arogya_hasSeenWelcome');
      if (hasSeenWelcome) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/welcome', { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  // Sync authMode from URL search params when browser back/forward is pressed
  useEffect(() => {
    const modeFromUrl = searchParams.get('mode') as AuthMode | null;
    if (modeFromUrl && validModes.includes(modeFromUrl) && modeFromUrl !== authMode) {
      setAuthMode(modeFromUrl);
      setAuthError('');
      setAuthSuccess('');
    }
  }, [searchParams]);

  // Auto-scroll to auth portal if requested (e.g. from /login URL proxy)
  useEffect(() => {
    if (window.location.pathname === '/login') {
      setTimeout(() => {
        document.getElementById('auth-portal')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, []);

  // Validation
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isValidPassword = (p: string) => p.length >= 6;

  const getPasswordStrength = (p: string): { label: string; color: string; width: string } => {
    if (p.length === 0) return { label: '', color: '', width: '0%' };
    if (p.length < 6) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (p.length < 8) return { label: 'Fair', color: 'bg-amber-500', width: '50%' };
    if (p.length < 12 && /[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: 'Strong', color: 'bg-emerald-500', width: '75%' };
    if (p.length >= 12 && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) return { label: 'Excellent', color: 'bg-violet-500', width: '100%' };
    return { label: 'Fair', color: 'bg-amber-500', width: '50%' };
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Auth Handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!isValidEmail(email)) { setAuthError('Please enter a valid email address'); return; }
    if (!isValidPassword(password)) { setAuthError('Password must be at least 6 characters'); return; }

    setIsSubmitting(true);
    const result = await login(email, password);
    if (!result.success) {
      setAuthError(result.error || 'Login failed');
    }
    // Navigation happens automatically via the centralized useEffect when user becomes truthy
    setIsSubmitting(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!name.trim()) { setAuthError('Please enter your name'); return; }
    if (!isValidEmail(email)) { setAuthError('Please enter a valid email address'); return; }
    if (!isValidPassword(password)) { setAuthError('Password must be at least 6 characters'); return; }

    setIsSubmitting(true);
    const result = await signup(name, email, password, gender);
    if (result.success) {
      // Account created — now send OTP for mandatory email verification
      const otpResult = await sendOtp(email);
      if (otpResult.success) {
        setSignupOtpCode(['', '', '', '', '', '']);
        switchAuthTo('signup-verify');
        setAuthSuccess(`Verification code sent to ${email}`);
        startResendCooldown();
        setTimeout(() => signupOtpRefs.current[0]?.focus(), 100);
      } else {
        // Account was created but OTP failed — still show verify screen so they can resend
        setSignupOtpCode(['', '', '', '', '', '']);
        switchAuthTo('signup-verify');
        setAuthError('Could not send verification code. Tap Resend below.');
      }
    } else {
      if (result.error && result.error.includes('already exists')) {
        setAuthError(result.error);
        switchAuthTo('login');
      } else {
        setAuthError(result.error || 'Sign up failed');
      }
    }
    setIsSubmitting(false);
  };

  const startResendCooldown = () => {
    setResendCooldown(45);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendSignupOtp = async () => {
    if (resendCooldown > 0) return;
    setAuthError('');
    setIsSubmitting(true);
    const result = await sendOtp(email);
    if (result.success) {
      setAuthSuccess(`New code sent to ${email}`);
      startResendCooldown();
    } else {
      setAuthError(result.error || 'Failed to resend code');
    }
    setIsSubmitting(false);
  };

  const handleSignupOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...signupOtpCode];
    newOtp[index] = value;
    setSignupOtpCode(newOtp);
    if (value && index < 5) {
      signupOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleSignupOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !signupOtpCode[index] && index > 0) {
      signupOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleSignupVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const code = signupOtpCode.join('');
    if (code.length !== 6) { setAuthError('Please enter the 6-digit verification code'); return; }

    setIsSubmitting(true);
    const result = await verifyOtp(email, code);
    if (!result.success) {
      setAuthError(result.error || 'Invalid or expired code. Try again or resend.');
    }
    // On success, user state updates → centralized useEffect navigates to /welcome
    setIsSubmitting(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!isValidEmail(email)) { setAuthError('Please enter a valid email'); return; }

    setIsSubmitting(true);
    const result = await sendOtp(email);
    if (result.success) {
      switchAuthTo('otp-verify');
      setAuthSuccess(`OTP sent to ${email}`);
    } else {
      setAuthError(result.error || 'Failed to send OTP');
    }
    setIsSubmitting(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const code = otpCode.join('');
    if (code.length !== 6) { setAuthError('Please enter the 6-digit code'); return; }

    setIsSubmitting(true);
    const result = await verifyOtp(email, code);
    if (!result.success) {
      setAuthError(result.error || 'Invalid OTP');
    }
    // Navigation happens automatically via centralized useEffect
    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!isValidEmail(email)) { setAuthError('Please enter your email'); return; }

    setIsSubmitting(true);
    const result = await resetPassword(email);
    if (result.success) {
      switchAuthTo('email-sent');
      setAuthSuccess(`Password reset link sent to ${email}. Please check your inbox.`);
    } else {
      setAuthError(result.error || 'Failed to send reset link');
    }
    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setIsSubmitting(true);
    
    // Check if Firebase is using default placeholder keys
    if (!hasFirebaseConfig) {
      console.log('Firebase not configured. Triggering custom Google Accounts chooser modal.');
      setShowGoogleMockModal(true);
      setMockGoogleStep('select');
      setMockGoogleError('');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signInWithGoogle();
      if (!result) {
        setShowGoogleMockModal(true);
        setMockGoogleStep('select');
        setMockGoogleError('');
      }
    } catch (err) {
      console.warn('Google Sign-In caught error, using chooser overlay:', err);
      setShowGoogleMockModal(true);
      setMockGoogleStep('select');
      setMockGoogleError('');
    }
    setIsSubmitting(false);
  };

  const handleSelectMockEmail = (emailStr: string) => {
    setMockGoogleEmail(emailStr);
    setMockGoogleStep('otp');
    setMockGoogleOtp(['', '', '', '', '', '']);
    setMockGoogleError('');
    // Auto focus first OTP input after short delay
    setTimeout(() => {
      mockGoogleOtpRefs.current[0]?.focus();
    }, 100);
  };

  const handleMockGoogleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...mockGoogleOtp];
    newOtp[index] = value;
    setMockGoogleOtp(newOtp);

    if (value && index < 5) {
      mockGoogleOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleMockGoogleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !mockGoogleOtp[index] && index > 0) {
      mockGoogleOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyMockGoogleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = mockGoogleOtp.join('');
    if (code.length !== 6) {
      setMockGoogleError('Please enter the 6-digit verification code.');
      return;
    }
    
    setIsSubmitting(true);
    setMockGoogleError('');
    
    // Simulate API delay for realism
    setTimeout(() => {
      const namePrefix = mockGoogleEmail.split('@')[0];
      const userName = namePrefix
        .split('.')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      
      // Determine if they selected a pre-configured mock account (returning) or dynamic one (new user)
      const isReturning = ['krish.thakkar@gmail.com', 'krishna.hackathon@gmail.com'].includes(mockGoogleEmail);
      if (isReturning) {
        sessionStorage.removeItem('arogya_is_new_user');
      } else {
        sessionStorage.setItem('arogya_is_new_user', 'true');
      }
      
      const mockUser = {
        id: 'google-sim-' + Date.now(),
        name: userName,
        email: mockGoogleEmail,
        gender: 'other' as const,
        isGuest: false,
        isSimulated: true,
      };
      
      sessionStorage.setItem('arogya_guest_mode', JSON.stringify(mockUser));
      setIsSubmitting(false);
      setShowGoogleMockModal(false);
      
      // Trigger navigation by reloading page so AuthContext picks up session
      window.location.reload();
    }, 800);
  };

  const handleGuestMode = () => {
    continueAsGuest();
    // Navigation happens automatically via centralized useEffect when user becomes truthy
  };

  const switchAuthTo = (m: AuthMode) => {
    setAuthMode(m);
    setAuthError('');
    setAuthSuccess('');
    // Push mode to URL for browser back button support
    setSearchParams({ mode: m }, { replace: false });
  };

  const scrollToAuth = () => {
    document.getElementById('auth-portal')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Render variables helper
  const passwordStrength = getPasswordStrength(password);

  const features = [
    { icon: Droplets, title: 'Water Tracker', description: 'Track daily hydration with beautiful progress rings and smart reminders.', gradient: 'from-cyan-500 to-blue-600', glow: 'bg-cyan-400' },
    { icon: Moon, title: 'Sleep Analytics', description: 'Monitor sleep patterns, quality scores, and get actionable insights.', gradient: 'from-indigo-500 to-purple-600', glow: 'bg-indigo-400' },
    { icon: Footprints, title: 'Step Counter', description: 'GPS-powered step tracking with daily goals and weekly trends.', gradient: 'from-orange-500 to-red-500', glow: 'bg-orange-400' },
    { icon: Pill, title: 'Medication Reminders', description: 'Never miss a dose with smart scheduling and medication adherence tracking.', gradient: 'from-emerald-500 to-green-600', glow: 'bg-emerald-400' },
    { icon: Brain, title: 'Mental Wellness', description: 'Mood journaling, gratitude entries, and guided breathing exercises.', gradient: 'from-pink-500 to-rose-600', glow: 'bg-pink-400' },
    { icon: Scale, title: 'BMI & Vitals', description: 'Track weight, BMI, blood pressure, and heart rate in one convenient dashboard.', gradient: 'from-amber-500 to-yellow-600', glow: 'bg-amber-400' },
    { icon: Bot, title: 'AI Health Assistant', description: 'Ask health questions, get AI-powered wellness recommendations 24/7.', gradient: 'from-violet-500 to-blue-500', glow: 'bg-violet-400' },
    { icon: Trophy, title: 'Achievements & Streaks', description: 'Enjoy gamified health tracking to earn badges, build streaks, and level up.', gradient: 'from-yellow-500 to-orange-500', glow: 'bg-yellow-400' },
    { icon: FileText, title: 'Report Decoder', description: 'Upload medical reports for simple, instant explanations from our AI helper.', gradient: 'from-blue-500 to-indigo-600', glow: 'bg-blue-400' },
    { icon: MapPin, title: 'Nearby Hospitals', description: 'Find hospitals, clinics, and pharmacies near you on an interactive map.', gradient: 'from-red-500 to-pink-600', glow: 'bg-red-400' },
    { icon: Activity, title: 'Workout & Diet Plans', description: 'AI-generated fitness routines and meal plans based on your goals.', gradient: 'from-teal-500 to-cyan-600', glow: 'bg-teal-400' },
    { icon: Shield, title: 'Emergency Contacts', description: 'One-tap SOS system to instantly reach your emergency contacts.', gradient: 'from-red-600 to-red-800', glow: 'bg-red-500' },
  ];

  const howItWorks = [
    { step: '01', title: 'Sign Up in Seconds', description: 'Create your account using email, Google, or OTP without any hassle.', icon: Users },
    { step: '02', title: 'Track Your Health', description: 'Log water, sleep, steps, mood, and medications directly on your dashboard.', icon: TrendingUp },
    { step: '03', title: 'Get AI Insights', description: 'Our AI analyzes your data and gives daily personalized recommendations.', icon: Sparkles },
    { step: '04', title: 'Build Healthy Habits', description: 'Earn streaks, unlock badges, and build lasting wellness routines.', icon: Trophy },
  ];

  const themeOptions = [
    { id: 'light' as Theme, name: 'Pristine Light', color: 'bg-blue-400' },
    { id: 'dark' as Theme, name: 'Deep Space', color: 'bg-violet-600' },
    { id: 'emerald' as Theme, name: 'Emerald Care', color: 'bg-emerald-500' },
    { id: 'sunset' as Theme, name: 'Sunset Glow', color: 'bg-orange-500' },
    { id: 'neon' as Theme, name: 'Cyber Neon', color: 'bg-fuchsia-500' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-primary-custom overflow-x-hidden transition-colors duration-500">
      {/* ===== NAVBAR ===== */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-brand-bg/85 backdrop-blur-xl border-b border-card-custom"
        initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <motion.div className="relative" whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
              <div className="absolute inset-0 bg-brand-gradient rounded-xl blur-lg opacity-50" />
              <div className="relative bg-brand-gradient p-2 rounded-xl shadow-lg">
                <Heart className="h-5 w-5 text-white animate-pulse" />
              </div>
            </motion.div>
            <span className="text-xl font-black tracking-tight select-none">
              <span className="text-brand-color font-extrabold text-2xl">AROGYA</span>
              <span className="text-primary-custom"> CARE</span>
            </span>
          </div>

          <div className="flex items-center gap-3">

            <motion.button onClick={scrollToAuth}
              className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-semibold border border-card-custom transition-all"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Log In
            </motion.button>
            <motion.button onClick={scrollToAuth}
              className="px-5 py-2 rounded-full bg-brand-gradient text-white text-sm font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all border border-white/10"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]"
            animate={{ scale: [1, 1.25, 1], x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 15, repeat: Infinity }} />
          <motion.div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[140px]"
            animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0] }} transition={{ duration: 18, repeat: Infinity }} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] opacity-40" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Tagline Badge */}
          <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-card-custom text-xs font-semibold text-blue-200/80 mb-8"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Sparkles className="h-3.5 w-3.5 text-brand-from" />
            AI-Powered Personal Wellness Engine
          </motion.div>

          {/* 3D Floating Heart Logo */}
          <motion.div className="flex justify-center mb-8"
            initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.1, type: 'spring', stiffness: 100 }}>
            <div className="relative" style={{ perspective: '800px' }}>
              <motion.div
                className="relative"
                animate={{ rotateY: [0, 8, -8, 0], rotateX: [0, -4, 4, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="absolute inset-0 bg-brand-gradient rounded-3xl blur-2xl opacity-40 scale-150" />
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl border border-white/20">
                  <Heart className="h-14 w-14 text-white drop-shadow-xl animate-pulse" strokeWidth={2.5} />
                  <motion.div className="absolute inset-0 rounded-3xl overflow-hidden"
                    initial={{ x: '-100%' }} animate={{ x: '200%' }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}>
                    <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}>
            <span className="text-brand-color">AROGYA</span>
            <span className="text-primary-custom"> CARE</span>
          </motion.h1>

          <motion.p className="text-xl sm:text-2xl text-blue-100/70 max-w-2xl mx-auto mb-3 font-medium leading-relaxed"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            Your health, finally in sync.
          </motion.p>


          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <motion.button onClick={scrollToAuth}
              className="group px-8 py-4 rounded-full bg-brand-gradient text-white font-bold text-lg shadow-xl shadow-black/25 flex items-center gap-3 border border-white/10"
              whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              Get Started Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-full bg-white/5 border border-card-custom text-white font-semibold text-lg hover:bg-white/10 transition-all flex items-center gap-3"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Explore Features
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative py-16 border-y border-card-custom bg-black/10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <StatCard value="12+" label="Health Trackers" delay={0} />
          <StatCard value="AI" label="Powered Insights" delay={0.1} />
          <StatCard value="24/7" label="Wellness Assistant" delay={0.2} />
          <StatCard value="100%" label="Secure Data" delay={0.3} />
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section id="features" className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-card-custom text-xs font-semibold text-brand-from mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Core Capabilities
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Explore Our All-In-One{' '}
              <span className="text-brand-color">Health Suite</span>
            </h2>
            <p className="text-blue-200/50 max-w-xl mx-auto text-base">
              A comprehensive system offering water tracking, mood analytics, workouts, AI diagnostic assistance, nearby hospitals, and emergency configurations.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-24 px-4 bg-black/5 border-t border-card-custom">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-card-custom text-xs font-semibold text-brand-from mb-4">
              <Clock className="h-3.5 w-3.5" /> Workflow
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Quick & Easy{' '}
              <span className="text-brand-color">Onboarding</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 0.1}>
                <div className="relative group text-center">
                  {i < 3 && <div className="hidden lg:block absolute top-12 left-[calc(100%+1rem)] w-[calc(100%-2rem)] h-px bg-gradient-to-r from-white/10 to-transparent" />}
                  <div className="relative inline-flex mb-5">
                    <div className="absolute inset-0 bg-brand-gradient rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
                    <div className="relative bg-white/5 border border-card-custom p-5 rounded-2xl group-hover:bg-white/10 transition-all">
                      <item.icon className="h-8 w-8 text-brand-from" />
                    </div>
                  </div>
                  <p className="text-brand-from font-black text-xs tracking-widest mb-1">{item.step}</p>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-blue-200/50">{item.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI ASSISTANT SPECS ===== */}
      <section className="relative py-24 px-4 overflow-hidden border-t border-card-custom">
        <div className="max-w-6xl mx-auto relative">
          <AnimatedSection>
            <div className="bg-white/5 border border-card-custom rounded-[2.5rem] p-10 sm:p-14 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-from/5 rounded-full blur-[120px]" />
              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-card-custom text-xs font-semibold text-brand-from mb-6">
                    <Bot className="h-3.5 w-3.5" /> Intelligence Layer
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                    Intuitive Companion &{' '}
                    <span className="text-brand-color">Insight Engines</span>
                  </h2>
                  <p className="text-blue-200/50 leading-relaxed mb-6">
                    Leverage advanced artificial intelligence to analyze cumulative statistics over steps, hydration levels, and mood indexes, generating daily actionable guidelines to maximize performance.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {['24/7 Support', 'Privacy Guard', 'Deep Analytics', 'Disclaimers Verified'].map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-full bg-white/5 border border-card-custom text-xs font-semibold text-blue-200/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center">
                  <motion.div className="relative w-64 h-64"
                    animate={{ rotateY: [0, 6, -6, 0], rotateX: [0, -3, 3, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
                    <div className="absolute inset-0 bg-brand-gradient rounded-3xl blur-2xl opacity-20" />
                    <div className="relative h-full bg-slate-950/70 border border-card-custom rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                      <Bot className="h-16 w-16 text-brand-from mb-4" />
                      <p className="text-white font-bold text-lg">AROGYA CARE AI</p>
                      <p className="text-blue-200/40 text-xs mt-1">Analyzing wellness indexes...</p>
                      <motion.div className="mt-4 flex gap-1.5"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-2.5 h-2.5 rounded-full bg-brand-to animate-ping" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== INTEGRATED LOGIN & SIGNUP PORTAL ===== */}
      <section id="auth-portal" className="relative py-28 px-4 bg-black/10 border-t border-card-custom scroll-mt-16">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[30%] left-[20%] w-[350px] h-[350px] bg-brand-from/5 rounded-full blur-[90px]" />
          <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-brand-to/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-md mx-auto relative z-10">
          <AnimatedSection className="text-center mb-10">
            <Heart className="h-10 w-10 text-brand-from mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Arogya Care Portal</h2>
            <p className="text-sm text-blue-200/50">Log in, sign up, or test features instantly</p>
          </AnimatedSection>

          {/*Frosted Glass Auth Card */}
          <motion.div
            className="glass-card p-7 sm:p-9 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}>
            
            {/* Email Sent view */}
            {authMode === 'email-sent' && (
              <motion.div className="text-center py-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="inline-flex items-center justify-center mb-6 p-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20">
                  <CheckCircle className="h-10 w-10 text-white animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Inbox Notification</h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">{authSuccess}</p>
                <button onClick={() => switchAuthTo('login')} className="text-xs font-bold text-brand-from hover:text-white transition-colors underline underline-offset-4">
                  ← Return to Sign In
                </button>
              </motion.div>
            )}

            {/* Mandatory Signup Email Verification */}
            {authMode === 'signup-verify' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border border-emerald-500/20 mb-3">
                    <Shield className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Verify Your Email</h3>
                  <p className="text-xs text-blue-200/60 mt-1">A 6-digit code was sent to <span className="text-white font-semibold">{email}</span></p>
                  <p className="text-[10px] text-blue-200/40 mt-1">You must verify your email to complete registration</p>
                </div>
                <form onSubmit={handleSignupVerifyOtp} className="space-y-4">
                  <div className="flex justify-center gap-2">
                    {signupOtpCode.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { signupOtpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleSignupOtpChange(i, e.target.value)}
                        onKeyDown={e => handleSignupOtpKeyDown(i, e)}
                        className="w-11 h-12 text-center text-xl font-bold bg-white/5 border border-card-custom rounded-xl text-white focus:border-emerald-400 outline-none focus:bg-white/10 transition-all"
                        placeholder="·"
                      />
                    ))}
                  </div>
                  {authError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> {authError}
                    </div>
                  )}
                  {authSuccess && !authError && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> {authSuccess}
                    </div>
                  )}
                  <button type="submit" disabled={isSubmitting} className="w-full py-3 btn-brand rounded-xl text-sm disabled:opacity-50">
                    {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendSignupOtp}
                      disabled={resendCooldown > 0 || isSubmitting}
                      className="text-xs font-bold text-brand-from hover:text-white transition-colors disabled:text-blue-200/30 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* OTP Verify view */}
            {authMode === 'otp-verify' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button onClick={() => switchAuthTo('otp-send')} className="flex items-center text-blue-200/80 hover:text-white text-xs mb-5 transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
                </button>
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-card-custom mb-3">
                    <KeyRound className="h-6 w-6 text-brand-from" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Enter OTP Token</h3>
                  <p className="text-xs text-blue-200/60 mt-1">Verification code sent to {email}</p>
                </div>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="flex justify-center gap-2">
                    {otpCode.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-11 h-12 text-center text-xl font-bold bg-white/5 border border-card-custom rounded-xl text-white focus:border-brand-from outline-none focus:bg-white/10 transition-all"
                        placeholder="·"
                      />
                    ))}
                  </div>
                  {authError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> {authError}
                    </div>
                  )}
                  <button type="submit" disabled={isSubmitting} className="w-full py-3 btn-brand rounded-xl text-sm disabled:opacity-50">
                    Verify Code
                  </button>
                </form>
              </motion.div>
            )}

            {/* OTP Send view */}
            {authMode === 'otp-send' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button onClick={() => switchAuthTo('login')} className="flex items-center text-blue-200/80 hover:text-white text-xs mb-5 transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
                </button>
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-card-custom mb-3">
                    <Send className="h-6 w-6 text-brand-from" />
                  </div>
                  <h3 className="text-lg font-bold text-white">One-Time Password</h3>
                  <p className="text-xs text-blue-200/60 mt-1">Access AROGYA CARE securely via mail link</p>
                </div>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-200/60 uppercase mb-1 tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/40" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-sm focus:border-brand-from focus:bg-white/10 outline-none text-white transition-all" />
                    </div>
                  </div>
                  {authError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> {authError}
                    </div>
                  )}
                  <button type="submit" disabled={isSubmitting} className="w-full py-3 btn-brand rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    Send Code <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* Forgot Password view */}
            {authMode === 'forgot' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button onClick={() => switchAuthTo('login')} className="flex items-center text-blue-200/80 hover:text-white text-xs mb-5 transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
                </button>
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-card-custom mb-3">
                    <Lock className="h-6 w-6 text-brand-from" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Reset Account</h3>
                  <p className="text-xs text-blue-200/60 mt-1">Receive password change instructions via email</p>
                </div>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-200/60 uppercase mb-1 tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/40" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-sm focus:border-brand-from focus:bg-white/10 outline-none text-white transition-all" />
                    </div>
                  </div>
                  {authError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> {authError}
                    </div>
                  )}
                  <button type="submit" disabled={isSubmitting} className="w-full py-3 btn-brand rounded-xl text-sm disabled:opacity-50">
                    Send Link
                  </button>
                </form>
              </motion.div>
            )}

            {/* Standard Login / Signup Forms */}
            {(authMode === 'login' || authMode === 'signup') && (
              <motion.div initial={{ opacity: 1 }} className="space-y-6">
                {/* Switcher Tab */}
                <div className="relative flex bg-white/5 border border-card-custom rounded-full p-1">
                  <motion.div
                    className="absolute top-1 bottom-1 rounded-full bg-white/10"
                    layoutId="portal-tab"
                    style={{
                      left: authMode === 'login' ? '4px' : '50%',
                      right: authMode === 'login' ? '50%' : '4px'
                    }}
                  />
                  <button onClick={() => switchAuthTo('login')} className={`flex-1 z-10 py-2 text-xs font-bold transition-colors ${authMode === 'login' ? 'text-white' : 'text-blue-200/50 hover:text-white'}`}>
                    Sign In
                  </button>
                  <button onClick={() => switchAuthTo('signup')} className={`flex-1 z-10 py-2 text-xs font-bold transition-colors ${authMode === 'signup' ? 'text-white' : 'text-blue-200/50 hover:text-white'}`}>
                    Register
                  </button>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {authError}
                  </div>
                )}

                <form onSubmit={authMode === 'login' ? handleLoginSubmit : handleSignupSubmit} className="space-y-4">
                  {/* Name field (signup only) */}
                  <AnimatePresence>
                    {authMode === 'signup' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <label className="block text-[10px] font-bold text-blue-200/60 uppercase mb-1 tracking-wider">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/40" />
                          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe"
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-sm focus:border-brand-from focus:bg-white/10 outline-none text-white transition-all" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-bold text-blue-200/60 uppercase mb-1 tracking-wider">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/40" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-card-custom rounded-xl text-sm focus:border-brand-from focus:bg-white/10 outline-none text-white transition-all" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-bold text-blue-200/60 uppercase tracking-wider">Password</label>
                      {authMode === 'login' && (
                        <button type="button" onClick={() => switchAuthTo('forgot')} className="text-[10px] font-bold text-brand-from hover:text-white transition-colors">
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200/40" />
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-card-custom rounded-xl text-sm focus:border-brand-from focus:bg-white/10 outline-none text-white transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/40 hover:text-white">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {authMode === 'signup' && password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[9px] font-semibold text-blue-200/40">
                          <span>Security Index</span>
                          <span>{passwordStrength.label}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${passwordStrength.color} transition-all duration-300`} style={{ width: passwordStrength.width }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gender (signup only) */}
                  <AnimatePresence>
                    {authMode === 'signup' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1">
                        <label className="block text-[10px] font-bold text-blue-200/60 uppercase tracking-wider">Gender</label>
                        <div className="flex gap-2">
                          {(['male', 'female', 'other'] as const).map(g => (
                            <button key={g} type="button" onClick={() => setGender(g)}
                              className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                                gender === g
                                  ? 'bg-brand-gradient text-white border-white/20'
                                  : 'bg-white/5 border-card-custom text-blue-200/60 hover:bg-white/10'
                              }`}>
                              {g}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button type="submit" disabled={isSubmitting} className="w-full py-3.5 btn-brand rounded-xl text-sm disabled:opacity-50 mt-4 flex items-center justify-center gap-2">
                    {isSubmitting ? 'Loading...' : authMode === 'login' ? 'Sign In' : 'Register Account'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-4 text-[9px] font-bold text-blue-200/30 uppercase tracking-widest">Alternative</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div className="space-y-2">
                  <button onClick={handleGoogleSignIn} className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all">
                    <Chrome className="h-4.5 w-4.5 text-blue-500" /> Sign In with Google
                  </button>
                  <button onClick={() => switchAuthTo('otp-send')} className="w-full py-3 bg-white/5 border border-card-custom hover:bg-white/10 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
                    <KeyRound className="h-4 w-4 text-brand-from" /> Email Verification OTP
                  </button>
                  <button onClick={handleGuestMode} className="w-full py-2 bg-transparent text-blue-200/40 hover:text-white font-semibold text-xs transition-all text-center">
                    Continue as Guest Explorer
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-card-custom py-12 px-4 bg-black/20 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-brand-gradient p-1.5 rounded-lg">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-wide">
              <span className="text-brand-color">AROGYA</span> <span className="text-primary-custom">CARE</span>
            </span>
          </div>
          <p className="text-xs text-blue-200/30">
            Made with <span className="text-red-400">❤</span> by <span className="text-blue-200/50 font-bold">Abhijit Chauhan & Krishna</span> for MSME IDEA Hackathon 6.0
          </p>
          <p className="text-xs text-blue-200/20">© {new Date().getFullYear()} AROGYA CARE. All rights reserved.</p>
        </div>
      </footer>

      {/* ===== INTERACTIVE MOCK GOOGLE ACCOUNT CHOOSER OVERLAY ===== */}
      <AnimatePresence>
        {showGoogleMockModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop blur */}
            <motion.div 
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isSubmitting) setShowGoogleMockModal(false); }}
            />

            {/* Modal Card */}
            <motion.div
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden text-left"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              {/* Google Brand Logo Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Chrome className="h-6 w-6 text-blue-500" />
                  <span className="text-lg font-bold tracking-tight text-white">Google</span>
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  {mockGoogleStep === 'select' ? 'Choose an account' : 'Confirm your identity'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  to continue to <span className="text-brand-from font-semibold">Aarogya Care</span>
                </p>
              </div>

              {mockGoogleStep === 'select' && (
                <div className="space-y-3">
                  {/* Account List */}
                  {[
                    { name: 'Krishna Thakkar', email: 'krish.thakkar@gmail.com', initial: 'K', color: 'bg-emerald-500' },
                    { name: 'Abhijit Chauhan', email: 'abhijit.chauhan@gmail.com', initial: 'A', color: 'bg-indigo-500' },
                    { name: 'Aarogya Care Demo', email: 'arogya.demo@gmail.com', initial: 'D', color: 'bg-rose-500' }
                  ].map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => handleSelectMockEmail(acc.email)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${acc.color} shadow-inner`}>
                        {acc.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate group-hover:text-brand-from transition-colors">{acc.name}</p>
                        <p className="text-xs text-slate-400 truncate">{acc.email}</p>
                      </div>
                    </button>
                  ))}

                  {/* Use another account option */}
                  {!showCustomEmailInput ? (
                    <button 
                      onClick={() => setShowCustomEmailInput(true)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left text-xs font-bold text-brand-from hover:text-white"
                    >
                      <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center text-sm text-slate-400">
                        +
                      </div>
                      <span>Use another account</span>
                    </button>
                  ) : (
                    <motion.div 
                      className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enter Custom Email</label>
                      <div className="flex gap-2">
                        <input 
                          type="email"
                          value={customMockEmail}
                          onChange={(e) => setCustomMockEmail(e.target.value)}
                          placeholder="yourname@gmail.com"
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs focus:border-brand-from outline-none text-white"
                        />
                        <button 
                          onClick={() => {
                            if (customMockEmail.trim() && customMockEmail.includes('@')) {
                              handleSelectMockEmail(customMockEmail.trim());
                            }
                          }}
                          className="px-3 py-2 bg-brand-gradient text-white rounded-xl text-xs font-bold"
                        >
                          Next
                        </button>
                      </div>
                      <button 
                        onClick={() => setShowCustomEmailInput(false)}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  )}

                  <div className="text-[10px] text-slate-400/80 leading-relaxed mt-4 pt-4 border-t border-white/5">
                    To continue, Google will share your name, email address, profile picture, and language preference with Aarogya Care. See Aarogya Care's <span className="underline cursor-pointer">Privacy Policy</span> and <span className="underline cursor-pointer">Terms of Service</span>.
                  </div>
                </div>
              )}

              {mockGoogleStep === 'otp' && (
                <div className="space-y-5">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                      {mockGoogleEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-300 truncate">{mockGoogleEmail}</p>
                    </div>
                    <button 
                      onClick={() => setMockGoogleStep('select')}
                      className="text-xs text-brand-from hover:text-white"
                    >
                      Change
                    </button>
                  </div>

                  <form onSubmit={handleVerifyMockGoogleOtp} className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-300 text-center mb-3">
                        A 6-digit confirmation code was sent to your email. Enter it below to sign in.
                      </p>
                      
                      <div className="flex justify-center gap-2">
                        {mockGoogleOtp.map((digit, i) => (
                          <input
                            key={i}
                            ref={el => { mockGoogleOtpRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleMockGoogleOtpChange(i, e.target.value)}
                            onKeyDown={e => handleMockGoogleOtpKeyDown(i, e)}
                            className="w-11 h-12 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:border-brand-from outline-none focus:bg-white/10 transition-all"
                            placeholder="·"
                          />
                        ))}
                      </div>
                    </div>

                    {mockGoogleError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 text-center">
                        {mockGoogleError}
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-3 bg-brand-gradient text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
