'use client';

import type {User} from 'firebase/auth';
import {onAuthStateChanged} from 'firebase/auth';
import {createContext, useEffect, useState} from 'react';
import {auth} from '@/lib/firebase/config';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{user, loading}}>{children}</AuthContext.Provider>;
}
