import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Navigate, useLocation } from 'react-router-dom';

interface UserProfile {
  nickname?: string;
  lolAccount?: string;
  registrationCompleted?: boolean;
  role: 'client' | 'booster';  // Nuevo campo
  // Campos específicos para boosters
  isBooster?: {
    active: boolean;
    completedBoosts: number;
    rating: number;
    currentBoosts: string[];  // IDs de boosts activos
    completedBoostIds: string[];  // Historial de boosts
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userProfile: UserProfile | null;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userProfile: null,
  updateUserProfile: async () => {},
});

export const VerifiedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || (!user.emailVerified && user.providerData[0].providerId === 'password')) {
    return <Navigate to="/verify-email" state={{ from: location }} />;
  }

  return <>{children}</>;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      } else {
        // Establecer 'client' como rol por defecto para nuevos usuarios
        setUserProfile({ 
          registrationCompleted: false,
          role: 'client' // Valor por defecto
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const updateUserProfile = async (profile: UserProfile) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
      setUserProfile(prev => ({ ...prev, ...profile }));
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, userProfile, updateUserProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);