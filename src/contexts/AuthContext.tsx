import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { hasFirebaseConfig } from '../lib/firebase';

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
      // Check for guest session only
      const guestSession = sessionStorage.getItem('arogya_guest_mode');
      if (guestSession) {
        try {
          const parsed = JSON.parse(guestSession);
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
  }, [firebaseUser, firebaseLoading]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    if (!hasFirebaseConfig) {
      return { success: false, error: 'Service temporarily unavailable. Please try again shortly.' };
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
    if (!hasFirebaseConfig) {
      return { success: false, error: 'Service temporarily unavailable. Please try again shortly.' };
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
      return { success: false, error: 'Service temporarily unavailable. Please try again shortly.' };
    }

    try {
      await signInWithOtp(email);
      return { success: true };
    } catch (error: any) {
      console.error('OTP send error:', error);
      return { success: false, error: error?.message || 'Failed to send sign-in link. Please try again.' };
    }
  };

  const verifyOtp = async (_email: string, _token: string): Promise<AuthResult> => {
    // Firebase email link sign-in is handled automatically in useFirebaseAuth
    // when the user clicks the link and returns to the app.
    // This function is kept for interface compatibility.
    // The auth state change will be detected by onAuthStateChanged.
    return { success: true };
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    if (!hasFirebaseConfig) {
      return { success: false, error: 'Service temporarily unavailable. Please try again shortly.' };
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
    if (!hasFirebaseConfig) {
      console.error('Google Sign-In unavailable: Firebase not configured.');
      return false;
    }

    try {
      await firebaseSignInWithGoogle();
      // onAuthStateChanged will detect the new user and update state
      return true;
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        return false; // User closed the popup, not a real error
      }
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
