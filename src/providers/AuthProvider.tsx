import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthError,
  User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { avatarStorage } from '../lib/avatarStorage';
import { firebaseAuth } from '../lib/firebase';
import { User } from '../types';

const SESSION_KEY = '@learnify_firebase_session';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  localAvatar: string | null;
  isLoading: boolean;
  isRegistering: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  clearRegistering: () => void;
  updateAvatar: (uri: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapFirebaseUser(fbUser: FirebaseUser): User {
  return {
    _id: fbUser.uid,
    name: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'Learner',
    email: fbUser.email ?? '',
    avatar: fbUser.photoURL ?? undefined,
    enrolledCourses: 0,
    progress: 0,
  };
}

function mapFirebaseError(error: AuthError): string {
  switch (error.code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  // On mount: restore session + local avatar from AsyncStorage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [raw, avatar] = await Promise.all([
          AsyncStorage.getItem(SESSION_KEY),
          avatarStorage.get(),
        ]);
        if (raw) setUser(JSON.parse(raw) as User);
        if (avatar) setLocalAvatar(avatar);
      } catch {
        // Non-fatal
      }
    };
    restoreSession();
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (fbUser) {
        const mapped = mapFirebaseUser(fbUser);
        setFirebaseUser(fbUser);
        setUser(mapped);
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(mapped));
      } else {
        setFirebaseUser(null);
        setUser(null);
        await AsyncStorage.removeItem(SESSION_KEY);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (error) {
      throw new Error(mapFirebaseError(error as AuthError));
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      setIsRegistering(true); // block auth layout redirect during overlay
      const { user: fbUser } = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      );
      await updateProfile(fbUser, { displayName: name });
      const mapped = mapFirebaseUser({ ...fbUser, displayName: name });
      setUser(mapped);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(mapped));
    } catch (error) {
      setIsRegistering(false);
      throw new Error(mapFirebaseError(error as AuthError));
    }
  };

  const clearRegistering = () => setIsRegistering(false);

  const loginWithGoogle = async (idToken: string): Promise<void> => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(firebaseAuth, credential);
    } catch (error) {
      throw new Error(mapFirebaseError(error as AuthError));
    }
  };

  const logout = async (): Promise<void> => {
    await signOut(firebaseAuth);
    await AsyncStorage.removeItem(SESSION_KEY);
    await avatarStorage.remove();
    setLocalAvatar(null);
  };

  const updateAvatar = async (uri: string): Promise<void> => {
    if (uri) {
      await avatarStorage.save(uri);
      setLocalAvatar(uri);
    } else {
      await avatarStorage.remove();
      setLocalAvatar(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, firebaseUser, localAvatar, isLoading, isRegistering, login, register, loginWithGoogle, clearRegistering, logout, updateAvatar }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
