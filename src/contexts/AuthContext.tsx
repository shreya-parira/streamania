import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

interface UserData {
  uid: string;
  email: string;
  username: string;
  isAdmin: boolean;
  wallet: number;
  createdAt: Date;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  updateUserProfile: (username: string, email: string) => Promise<void>;
  getAllUsers: () => Promise<UserData[]>;
  topUpUserWallet: (userId: string, amount: number) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if username is unique
  const isUsernameUnique = async (username: string, excludeUid?: string): Promise<boolean> => {
    const usersQuery = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(usersQuery);
    
    if (excludeUid) {
      return querySnapshot.docs.every(doc => doc.id === excludeUid);
    }
    
    return querySnapshot.empty;
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Check if username is unique
      const unique = await isUsernameUnique(username);
      if (!unique) {
        throw new Error('Username already exists. Please choose a different username.');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's display name
      await updateProfile(user, { displayName: username });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
        isAdmin: false,
        wallet: 1000, // Starting wallet amount
        createdAt: new Date(),
        emailVerified: user.emailVerified
      });

      toast({
        title: "Account created successfully",
        description: "Welcome to Streamania! You've been given 1000 starting points.",
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password reset email sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      await updatePassword(user, newPassword);
      toast({
        title: "Password changed successfully",
        description: "Your password has been updated.",
      });
    } catch (error: any) {
      console.error('Change password error:', error);
      throw new Error(error.message || 'Failed to change password');
    }
  };

  const updateUserProfile = async (username: string, email: string) => {
    if (!user || !userData) return;

    try {
      // Check if username is unique (excluding current user)
      const unique = await isUsernameUnique(username, user.uid);
      if (!unique) {
        throw new Error('Username already exists. Please choose a different username.');
      }

      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email
      });

      // Update display name in auth
      await updateProfile(user, { displayName: username });

      // Update local state
      setUserData(prev => prev ? { ...prev, username, email } : null);

      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been updated.",
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const getAllUsers = async (): Promise<UserData[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      } as UserData));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  };

  const topUpUserWallet = async (userId: string, amount: number) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        wallet: increment(amount)
      });

      toast({
        title: "Wallet topped up successfully",
        description: `Added ${amount} points to user's wallet.`,
      });
    } catch (error) {
      console.error('Error topping up wallet:', error);
      throw new Error('Failed to top up wallet');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    logout,
    resetPassword,
    changePassword,
    updateUserProfile,
    getAllUsers,
    topUpUserWallet
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
