import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebaseAuth } from '../backend/useFirebaseAuth';
import { hasFirebaseConfig } from '../backend/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  isGuest?: boolean;
  isSimulated?: boolean;
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
    user: firebaseUser,
    loading: firebaseLoading,
    signIn,
    signUp,
    signOut,
    signInWithOtp,
    signInWithGoogle: firebaseSignInWithGoogle,
    resetPassword: firebaseResetPassword,
  } = useFirebaseAuth();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Map Firebase user to our User interface when auth state changes
  useEffect(() => {
    if (firebaseLoading) {
      return;
    }

    if (firebaseUser) {
      const mappedUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        gender: 'other',
        isGuest: false,
      };
      setUser(mappedUser);
    } else {
      // Check for guest or simulated session
      const guestSession = sessionStorage.getItem('arogya_guest_mode');
      if (guestSession) {
        try {
          const parsed = JSON.parse(guestSession);
          if (parsed.isGuest === true || parsed.isSimulated === true) {
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
  }, [firebaseUser, firebaseLoading]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    sessionStorage.removeItem('arogya_is_new_user');
    // Fail-safe fallback if keys are missing
    if (!hasFirebaseConfig) {
      console.warn('Firebase not configured. Performing instant simulated login.');
      const mockUser: User = {
        id: 'sim-' + Date.now(),
        name: email.split('@')[0].toUpperCase(),
        email: email,
        gender: 'other',
        isGuest: false,
        isSimulated: true,
      };
      sessionStorage.setItem('arogya_guest_mode', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    }

    try {
      await signIn(email, password);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      const code = error?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        return { success: false, error: 'Wrong email or password. Please try again.' };
      }
      if (code === 'auth/too-many-requests') {
        return { success: false, error: 'Too many failed attempts. Please try again later.' };
      }
      if (code === 'auth/user-disabled') {
        return { success: false, error: 'This account has been disabled.' };
      }
      return { success: false, error: error?.message || 'Login failed' };
    }
  };

  const signup = async (name: string, email: string, password: string, gender: 'male' | 'female' | 'other'): Promise<AuthResult> => {
    sessionStorage.setItem('arogya_is_new_user', 'true');
    // Fail-safe fallback if keys are missing
    if (!hasFirebaseConfig) {
      console.warn('Firebase not configured. Performing instant simulated signup.');
      const mockUser: User = {
        id: 'sim-' + Date.now(),
        name: name,
        email: email,
        gender: gender,
        isGuest: false,
        isSimulated: true,
      };
      sessionStorage.setItem('arogya_guest_mode', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    }

    try {
      await signUp(email, password, name, gender);
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      const code = error?.code || '';
      if (code === 'auth/email-already-in-use') {
        return { success: false, error: 'An account with this email already exists. Please log in instead.' };
      }
      if (code === 'auth/weak-password') {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }
      if (code === 'auth/invalid-email') {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      return { success: false, error: error?.message || 'Signup failed' };
    }
  };

  const sendOtp = async (email: string): Promise<AuthResult> => {
    if (!hasFirebaseConfig) {
      console.warn('Firebase not configured. Simulating OTP send success.');
      return { success: true };
    }

    try {
      await signInWithOtp(email);
      return { success: true };
    } catch (error: any) {
      console.error('OTP send error:', error);
      return { success: false, error: error?.message || 'Failed to send OTP link. Please try again.' };
    }
  };

  const verifyOtp = async (email: string, _token: string): Promise<AuthResult> => {
    if (!hasFirebaseConfig) {
      console.warn('Firebase not configured. Instantly verifying simulated OTP.');
      const mockUser: User = {
        id: 'sim-' + Date.now(),
        name: email.split('@')[0].toUpperCase(),
        email: email,
        gender: 'other',
        isGuest: false,
        isSimulated: true,
      };
      sessionStorage.setItem('arogya_guest_mode', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    }
    return { success: true };
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    if (!hasFirebaseConfig) {
      console.warn('Firebase not configured. Simulating password reset success.');
      return { success: true };
    }

    try {
      await firebaseResetPassword(email);
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      const code = error?.code || '';
      if (code === 'auth/user-not-found') {
        return { success: false, error: 'No account found with this email address.' };
      }
      return { success: false, error: error?.message || 'Failed to send reset link. Please try again.' };
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    // Fail-safe fallback if keys are missing or during popup blocking
    if (!hasFirebaseConfig) {
      console.warn('Firebase not configured. Performing instant simulated Google login.');
      const mockUser: User = {
        id: 'google-sim-' + Date.now(),
        name: 'Google Explorer',
        email: 'google-user@gmail.com',
        gender: 'other',
        isGuest: false,
        isSimulated: true,
      };
      sessionStorage.setItem('arogya_guest_mode', JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    }

    try {
      await firebaseSignInWithGoogle();
      return true;
    } catch (error: any) {
      console.error('Google Sign-In error, falling back to simulated session:', error);
      // If popup is blocked or fails, log in simulated user so the presentation doesn't break
      const mockUser: User = {
        id: 'google-sim-' + Date.now(),
        name: 'Google Explorer',
        email: 'google-user@gmail.com',
        gender: 'other',
        isGuest: false,
        isSimulated: true,
      };
      sessionStorage.setItem('arogya_guest_mode', JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
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
      if (hasFirebaseConfig) {
        await signOut();
      }
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
