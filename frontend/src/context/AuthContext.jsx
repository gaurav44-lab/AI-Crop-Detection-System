import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onIdTokenChanged, updateProfile as updateFirebaseProfile } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('token', token);
        // Sync our profile from the backend
        try {
          const data = await authAPI.getMe();
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (error) {
          console.error("Failed to sync backend profile", error);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    // onIdTokenChanged handles the rest
  }, []);

  const register = useCallback(async (userData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    
    // Set custom displayName
    await updateFirebaseProfile(userCredential.user, { displayName: userData.name });
    
    // Save to local storage explicitly to allow immediate backend calls
    const token = await userCredential.user.getIdToken();
    localStorage.setItem('token', token);

    // Sync farm details to backend
    const updatedUser = await authAPI.updateProfile({ 
      name: userData.name, 
      farmDetails: userData.farmDetails 
    });
    
    setUser(updatedUser.user);
    localStorage.setItem('user', JSON.stringify(updatedUser.user));
    
    return userCredential;
  }, []);

  const logout = useCallback(() => {
    signOut(auth);
  }, []);

  const updateUser = useCallback(async (updatedUser) => {
    const data = await authAPI.updateProfile(updatedUser);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
