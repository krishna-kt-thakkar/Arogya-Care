import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { hasSupabaseConfig } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  isGuest?: boolean;
}

interface AuthResult {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string, gender: 'male' | 'female' | 'other') => Promise<AuthResult>;
  signInWithGoogle: () => Promise<boolean>;
  sendOtp: (email: string) => Promise<AuthResult>;
  verifyOtp: (email: string, token: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  continueAsGuest: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user: supabaseUser,
    loading: supabaseLoading,
    signIn,
    signUp,
    signOut,
    signInWithOtp,
    verifyOtp: supabaseVerifyOtp,
    resetPassword: supabaseResetPassword,
    signInWithGoogle: supabaseSignInWithGoogle,
  } = useSupabaseAuth();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Map Supabase user to our User interface when auth state changes
  useEffect(() => {
    if (supabaseLoading) {
      return;
    }

    if (supabaseUser) {
      const mappedUser: User = {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email || '',
        gender: supabaseUser.user_metadata?.gender || 'other',
        isGuest: false,
      };
      setUser(mappedUser);
    } else {
      // Check for guest session only — no mock users
      const guestSession = sessionStorage.getItem('arogya_guest_mode');
      if (guestSession) {
        try {
          const parsed = JSON.parse(guestSession);
          // Only restore if it was a genuine guest session (isGuest === true)
          if (parsed.isGuest === true) {
            setUser(parsed);
          } else {
            sessionStorage.removeItem('arogya_guest_mode');
            setUser(null);
          }
        } catch {
          sessionStorage.removeItem('arogya_guest_mode');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, [supabaseUser, supabaseLoading]);

  // --- Real auth functions — no mock fallbacks ---

  const login = async (email: string, password: string): Promise<AuthResult> => {
    if (!hasSupabaseConfig) {
      return { success: false, error: 'Service temporarily unavailable. Please try again shortly.' };
    }

    try {
      await signIn(email, password);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error?.message || 'Login failed';
      if (message.includes('Invalid login credentials')) {
        return { success: false, error: 'Wrong email or password. Please try again.' };
      }
      if (message.includes('Email not confirmed')) {
        return { success: false, error: 'Please verify your email before logging in. Check your inbox for the confirmation link.' };
      }
      return { success: false, error: message };
    }
  };

  const signup = async (name: string, email: string, password: string, gender: 'male' | 'female' | 'other'): Promise<AuthResult> => {
    if (!hasSupabaseConfig) {
      return { success: false, error: 'Service temporarily unavailable. Please try again shortly.' };
    }

    try {
      const data = await signUp(email, password, name, gender);

      // Check for duplicate email: Supabase returns a user with empty identities array
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { success: false, error: 'An account with this email already exists. Please log in instead.' };
      }

      if (data.user && !data.session) {
        return {
          success: true,
          needsEmailConfirmation: true,
        };
      }
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      const message = error?.message || 'Signup failed';
      if (message.includes('already registered') || message.includes('already been registered')) {
        return { success: false, error: 'An account with this email already exists. Please log in instead.' };
      }
      if (message.includes('valid email')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (message.includes('at least')) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }
      return { success: false, error: message };
    }
  };

  const sendOtp = async (email: string): Promise<AuthResult> => {
    if (!hasSupabaseConfig) {
      return { success: false, error: 'Service temporarily unavailable. Please try again shortly.' };
    }

    try {
      await signInWithOtp(email);
      return { success: true };
    } catch (error: any) {
      console.error('OTP send error:', error);
      return { success: false, error: error?.message || 'Failed to send OTP. Please try again.' };
    }
  };

  const verifyOtp = async (email: string, token: string): Promise<AuthResult> => {
    if (!hasSupabaseConfig) {
      return { success: false, error: 'Service temporarily unavailable. Please try again shortly.' };
    }

    try {
      await supabaseVerifyOtp(email, token);
      return { success: true };
    } catch (error: any) {
      console.error('OTP verification error:', error);
      const message = error?.message || 'Invalid OTP';
      if (message.includes('expired')) {
        return { success: false, error: 'OTP has expired. Please request a new one.' };
      }
      if (message.includes('invalid') || message.includes('Token')) {
        return { success: false, error: 'Invalid OTP code. Please check and try again.' };
      }
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    if (!hasSupabaseConfig) {
      return { success: false, error: 'Service temporarily unavailable. Please try again shortly.' };
    }

    try {
      await supabaseResetPassword(email);
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, error: error?.message || 'Failed to send reset link. Please try again.' };
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    if (!hasSupabaseConfig) {
      console.error('Google Sign-In unavailable: Supabase not configured.');
      return false;
    }

    try {
      const { error } = await supabaseSignInWithGoogle();
      if (error) {
        console.error('Google Sign-In error:', error.message);
        return false;
      }
      // OAuth is a redirect flow — browser navigates away to Google.
      // On return, onAuthStateChange in useSupabaseAuth will detect the session.
      return true;
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      return false;
    }
  };

  const continueAsGuest = () => {
    const guestUser: User = {
      id: 'guest-' + Date.now(),
      name: 'Guest User',
      email: '',
      gender: 'other',
      isGuest: true,
    };
    sessionStorage.setItem('arogya_guest_mode', JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const logout = async () => {
    try {
      sessionStorage.removeItem('arogya_guest_mode');
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, login, signup, signInWithGoogle,
      sendOtp, verifyOtp, resetPassword,
      continueAsGuest, logout, isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
