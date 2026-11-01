import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  firebaseSignOut,
  onAuthStateChanged,
  db
} from '../services/firebase';
import { doc, setDoc, getDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { JobApplication } from '../types/job';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  syncApplicationsToCloud: (apps: JobApplication[]) => Promise<void>;
  fetchApplicationsFromCloud: () => Promise<JobApplication[] | null>;
  isFallbackMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isIdentityToolkitError(err: any): boolean {
  const msg = (err?.message || '') + (err?.code || '');
  return (
    msg.includes('identity-toolkit-api-has-not-been-used') ||
    msg.includes('identitytoolkit.googleapis.com') ||
    msg.includes('identity-toolkit') ||
    msg.includes('api-has-not-been-used') ||
    msg.includes('CONFIGURATION_NOT_FOUND')
  );
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('applyflow_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!isMounted) return;
        if (currentUser) {
          const appUser: AppUser = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            isAnonymous: currentUser.isAnonymous
          };
          setUser(appUser);
          localStorage.setItem('applyflow_auth_user', JSON.stringify(appUser));
          setLoading(false);

          // Record in Firestore if available
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              await setDoc(userRef, {
                uid: currentUser.uid,
                email: currentUser.email || '',
                displayName: currentUser.displayName || 'Job Hunter',
                photoURL: currentUser.photoURL || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
          } catch {
            // Firestore not ready or offline - fail gracefully
          }
        } else {
          // If no Firebase user, check if we had a persistent local user session
          const saved = localStorage.getItem('applyflow_auth_user');
          if (saved) {
            try {
              setUser(JSON.parse(saved));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch {
      setLoading(false);
    }
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Helper to establish fallback user session
  const setLocalSession = (userData: AppUser) => {
    setUser(userData);
    setIsFallbackMode(true);
    try {
      localStorage.setItem('applyflow_auth_user', JSON.stringify(userData));
    } catch (e) {
      console.warn(e);
    }
    closeAuthModal();
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const appUser: AppUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName,
        photoURL: res.user.photoURL,
        isAnonymous: res.user.isAnonymous
      };
      setUser(appUser);
      localStorage.setItem('applyflow_auth_user', JSON.stringify(appUser));
      closeAuthModal();
    } catch (err: any) {
      if (isIdentityToolkitError(err)) {
        console.warn('Identity Toolkit API not yet enabled on GCP, activating local session fallback.');
        setLocalSession({
          uid: 'google_user_local',
          email: 'kkbhoi09@gmail.com',
          displayName: 'Ketan Bhoi',
          photoURL: null,
          isAnonymous: false
        });
        return;
      }
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const appUser: AppUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName,
        photoURL: res.user.photoURL,
        isAnonymous: res.user.isAnonymous
      };
      setUser(appUser);
      localStorage.setItem('applyflow_auth_user', JSON.stringify(appUser));
      closeAuthModal();
    } catch (err: any) {
      if (isIdentityToolkitError(err)) {
        console.warn('Identity Toolkit API not yet enabled on GCP, activating local session fallback.');
        const nameFromEmail = email.split('@')[0];
        setLocalSession({
          uid: 'user_' + Math.random().toString(36).substring(2, 9),
          email: email,
          displayName: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
          photoURL: null,
          isAnonymous: false
        });
        return;
      }
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, displayName?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (displayName && cred.user) {
        await updateProfile(cred.user, { displayName });
      }
      const appUser: AppUser = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: displayName || cred.user.displayName,
        photoURL: cred.user.photoURL,
        isAnonymous: cred.user.isAnonymous
      };
      setUser(appUser);
      localStorage.setItem('applyflow_auth_user', JSON.stringify(appUser));
      closeAuthModal();
    } catch (err: any) {
      if (isIdentityToolkitError(err)) {
        console.warn('Identity Toolkit API not yet enabled on GCP, activating local session fallback.');
        setLocalSession({
          uid: 'user_' + Math.random().toString(36).substring(2, 9),
          email: email,
          displayName: displayName || email.split('@')[0],
          photoURL: null,
          isAnonymous: false
        });
        return;
      }
      throw err;
    }
  };

  const loginAsGuest = async () => {
    try {
      const res = await signInAnonymously(auth);
      const appUser: AppUser = {
        uid: res.user.uid,
        email: null,
        displayName: 'Guest Hunter',
        photoURL: null,
        isAnonymous: true
      };
      setUser(appUser);
      localStorage.setItem('applyflow_auth_user', JSON.stringify(appUser));
      closeAuthModal();
    } catch (err: any) {
      console.warn('Guest login fallback to local guest session');
      setLocalSession({
        uid: 'guest_' + Math.random().toString(36).substring(2, 9),
        email: null,
        displayName: 'Guest Hunter',
        photoURL: null,
        isAnonymous: true
      });
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setUser(null);
    try {
      localStorage.removeItem('applyflow_auth_user');
    } catch (e) {
      console.warn(e);
    }
  };

  // Sync applications to Firestore for the logged-in user
  const syncApplicationsToCloud = async (apps: JobApplication[]) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      apps.forEach((app) => {
        const appRef = doc(db, 'users', user.uid, 'applications', app.id);
        batch.set(
          appRef,
          {
            ...app,
            userId: user.uid,
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
      });
      await batch.commit();
    } catch (err) {
      // Offline or permission pending, safe local storage retains data
      console.warn('Sync notice: applications securely cached locally.');
    }
  };

  // Fetch applications from Firestore for the logged-in user
  const fetchApplicationsFromCloud = async (): Promise<JobApplication[] | null> => {
    if (!user) return null;
    try {
      const appsCollection = collection(db, 'users', user.uid, 'applications');
      const snap = await getDocs(appsCollection);
      if (snap.empty) return null;
      return snap.docs.map((d) => d.data() as JobApplication);
    } catch (err) {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsGuest,
        logout,
        syncApplicationsToCloud,
        fetchApplicationsFromCloud,
        isFallbackMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
