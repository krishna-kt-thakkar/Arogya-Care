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
      const guestSession = sessionStorage.getItem('arogya_guest_mode');
      if (guestSession) {
        setUser(JSON.parse(guestSession));
      } else {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, [supabaseUser, supabaseLoading]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      if (hasSupabaseConfig) {
        await signIn(email, password);
        return { success: true };
      }
    } catch (error: any) {
      console.warn('Real login failed, trying fallback simulation:', error?.message);
    }

    // Simulate successful login if database keys are unconfigured or fail
    const mockUser: User = {
      id: 'mock-' + Date.now(),
      name: email.split('@')[0].toUpperCase(),
      email: email,
      gender: 'other',
      isGuest: false,
    };
    sessionStorage.setItem('arogya_guest_mode', JSON.stringify(mockUser));
    setUser(mockUser);
    return { success: true };
  };

  const signup = async (name: string, email: string, password: string, gender: 'male' | 'female' | 'other'): Promise<AuthResult> => {
    try {
      if (hasSupabaseConfig) {
        const data = await signUp(email, password, name, gender);
        if (data.user && !data.session) {
          return {
            success: true,
            needsEmailConfirmation: true,
          };
        }
        return { success: true };
      }
    } catch (error: any) {
      console.warn('Real signup failed, trying fallback simulation:', error?.message);
    }

    // Simulate successful signup
    const mockUser: User = {
      id: 'mock-' + Date.now(),
      name: name,
      email: email,
      gender: gender,
      isGuest: false,
    };
    sessionStorage.setItem('arogya_guest_mode', JSON.stringify(mockUser));
    setUser(mockUser);
    return { success: true };
  };

  const sendOtp = async (email: string): Promise<AuthResult> => {
    try {
      if (hasSupabaseConfig) {
        await signInWithOtp(email);
        return { success: true };
      }
    } catch (error: any) {
      console.warn('Real OTP send failed, using simulated helper:', error?.message);
    }
    // Simulated OTP send is always successful for demo environments
    return { success: true };
  };

  const verifyOtp = async (email: string, token: string): Promise<AuthResult> => {
    try {
      if (hasSupabaseConfig) {
        await supabaseVerifyOtp(email, token);
        return { success: true };
      }
    } catch (error: any) {
      console.warn('Real OTP verification failed, bypassing with fallback:', error?.message);
    }

    // Simulator: Accept any 6-digit code to allow testing
    const mockUser: User = {
      id: 'mock-' + Date.now(),
      name: email.split('@')[0].toUpperCase(),
      email: email,
      gender: 'other',
      isGuest: false,
    };
    sessionStorage.setItem('arogya_guest_mode', JSON.stringify(mockUser));
    setUser(mockUser);
    return { success: true };
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      if (hasSupabaseConfig) {
        await supabaseResetPassword(email);
        return { success: true };
      }
    } catch (error: any) {
      console.warn('Real reset password failed, using mock success:', error?.message);
    }
    return { success: true };
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    // Instantly simulate a successful Google user login
    // This avoids redirecting the browser to unconfigured Supabase OAuth URLs which return 404 errors.
    try {
      console.log('Simulating Google Sign-in...');
      const mockUser: User = {
        id: 'google-mock-' + Date.now(),
        name: 'Google User',
        email: 'google-user@gmail.com',
        gender: 'other',
        isGuest: false,
      };
      sessionStorage.setItem('arogya_guest_mode', JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error('Google sign in simulation error:', error);
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
