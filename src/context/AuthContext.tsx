import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  auth, 
  getOrCreateUserProfile, 
  updateUserProfile, 
  logStudySession, 
  deleteUserAccountData,
  db
} from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile, StudyLog } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, displayName: string, country?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGoogleRedirect: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logSession: (durationMinutes: number, subject: string, xpGained: number) => Promise<{
    log: StudyLog;
    levelUp: boolean;
    newLevel: number;
    badgesUnlocked: string[];
  }>;
  deleteAccount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  focusModeEnabled: boolean;
  setFocusModeEnabled: (enabled: boolean) => void;
  isTimerActive: boolean;
  setIsTimerActive: (active: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [focusModeEnabled, setFocusModeEnabledState] = useState(() => {
    return localStorage.getItem('focusModeEnabled') === 'true';
  });
  const [isTimerActive, setIsTimerActive] = useState(false);

  const setFocusModeEnabled = (enabled: boolean) => {
    setFocusModeEnabledState(enabled);
    localStorage.setItem('focusModeEnabled', String(enabled));
  };

  useEffect(() => {
    let active = true;

    // Check for Google Redirect login callbacks on initial load
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user && active) {
          console.log("Google redirect sign-in callback successful:", result.user);
          setUser(result.user);
          const userProfile = await getOrCreateUserProfile(result.user);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("Error processing Google redirect login callback:", error);
      }
    };

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser && active) {
        setUser(currentUser);
        try {
          const userProfile = await getOrCreateUserProfile(currentUser);
          setProfile(userProfile);
        } catch (error) {
          console.error("Error fetching or create user profile:", error);
        }
      } else if (active) {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signupWithEmail = async (email: string, password: string, displayName: string, country?: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Wait a tiny bit to make sure user gets created, then create custom profile
      const newUser = userCredential.user;
      const docRef = doc(db, 'users', newUser.uid);
      
      const newProfile: UserProfile = {
        userId: newUser.uid,
        displayName: displayName || email.split('@')[0],
        email: email,
        country: country || 'United States',
        createdAt: new Date().toISOString(),
        isPremium: false,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: '',
        totalMinutesStudied: 0,
        badges: country ? ['globe-trotter'] : [],
        timerWorkMinutes: 25,
        timerBreakMinutes: 5,
        timerLongBreakMinutes: 15,
        timerLongBreakInterval: 4,
        theme: 'warm-cozy',
        timeFont: 'font-timer-mono',
        ambientSound: 'none',
        soundEnabled: true,
        notificationsEnabled: true,
      };
      
      await setDoc(docRef, newProfile);
      setProfile(newProfile);
      setUser(newUser);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogleRedirect = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithRedirect(auth, provider);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("Must be logged in to update profile");
    
    await updateUserProfile(user.uid, updates);
    setProfile((prev) => prev ? { ...prev, ...updates } : null);
  };

  const logSession = async (durationMinutes: number, subject: string, xpGained: number) => {
    if (!user) throw new Error("Must be logged in to log sessions");
    
    const result = await logStudySession(user.uid, durationMinutes, subject, xpGained);
    
    // Refresh profile state
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      setProfile(snap.data() as UserProfile);
    }
    
    return result;
  };

  const deleteAccount = async () => {
    if (!user) throw new Error("Must be logged in to delete account");
    
    const uid = user.uid;
    // Perform complete deletion of cloud and auth states
    await deleteUserAccountData(uid);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      setProfile(snap.data() as UserProfile);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      loginWithGoogleRedirect,
      logout,
      updateProfile,
      logSession,
      deleteAccount,
      refreshProfile,
      focusModeEnabled,
      setFocusModeEnabled,
      isTimerActive,
      setIsTimerActive
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper imports that were missing
import { setDoc } from 'firebase/firestore';
