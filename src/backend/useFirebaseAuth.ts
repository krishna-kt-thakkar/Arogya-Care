import { useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Check if returning from email link sign-in
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const savedEmail = localStorage.getItem('arogya_otp_email');
      if (savedEmail) {
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(() => {
            localStorage.removeItem('arogya_otp_email');
          })
          .catch((error) => {
            console.error('Email link sign-in error:', error);
          });
      }
    }

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, gender: 'male' | 'female' | 'other') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Set display name
    await updateProfile(firebaseUser, { displayName: name });

    // Create user profile in Firestore
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid, 'profile', 'info'), {
        name,
        gender,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Profile creation warning:', error);
    }

    return { user: firebaseUser, session: userCredential };
  };

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Create/update profile in Firestore
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid, 'profile', 'info'), {
        name: firebaseUser.displayName || 'User',
        gender: 'other',
        email: firebaseUser.email || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.warn('Google profile creation warning:', error);
    }

    return { user: firebaseUser, error: null };
  };

  const signInWithOtp = async (email: string) => {
    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save email for when user clicks the link
    localStorage.setItem('arogya_otp_email', email);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signInWithOtp,
    signInWithGoogle,
    resetPassword,
    signOut,
  };
}
