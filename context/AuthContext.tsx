// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import firebase from 'firebase/app';

interface AuthContextProps {
  user: firebase.User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<firebase.auth.UserCredential>;
  signin: (email: string, password: string) => Promise<firebase.auth.UserCredential>;
  signout: () => Promise<void>;
  signInWithGoogle: () => Promise<firebase.auth.UserCredential>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  signup: async () => { throw new Error('Not implemented'); },
  signin: async () => { throw new Error('Not implemented'); },
  signout: async () => { throw new Error('Not implemented'); },
  signInWithGoogle: async () => { throw new Error('Not implemented'); },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = (email: string, password: string) => {
    return auth.createUserWithEmailAndPassword(email, password);
  };

  const signin = (email: string, password: string) => {
    return auth.signInWithEmailAndPassword(email, password);
  };

  const signout = () => {
    return auth.signOut();
  };

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, signin, signout, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
