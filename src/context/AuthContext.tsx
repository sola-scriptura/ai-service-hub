import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, AuthUser } from '@/services/authApi';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      console.log('[AuthContext] Initializing auth...');
      const startTime = Date.now();

      try {
        const currentUser = await authApi.getCurrentUser();
        console.log(`[AuthContext] getCurrentUser completed in ${Date.now() - startTime}ms`);
        console.log('[AuthContext] Current user:', currentUser?.id || 'none');
        setUser(currentUser);
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
        // Don't leave user in loading state on error
        setUser(null);
      } finally {
        setLoading(false);
        console.log('[AuthContext] Auth initialization complete');
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data } = authApi.onAuthStateChange((newUser) => {
      console.log('[AuthContext] Auth state changed:', newUser?.id || 'signed out');
      setUser(newUser);
      // Also ensure loading is false when auth state changes
      setLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('[AuthContext] ===== SIGN UP CALLED =====');
    console.log('[AuthContext] Email:', email);
    console.log('[AuthContext] Timestamp:', new Date().toISOString());

    const startTime = Date.now();

    try {
      const { user: newUser, error } = await authApi.signUp(email, password, fullName);

      console.log(`[AuthContext] authApi.signUp completed in ${Date.now() - startTime}ms`);
      console.log('[AuthContext] User:', newUser?.id || 'null');
      console.log('[AuthContext] Error:', error?.message || 'none');

      if (error) {
        console.error('[AuthContext] Sign up error:', error.message);
        return { error };
      }

      if (newUser) {
        console.log('[AuthContext] Setting user in context:', newUser.id);
        setUser(newUser);
        console.log('[AuthContext] User set successfully');
      } else {
        console.error('[AuthContext] No user returned but no error either');
        return { error: new Error('Sign up completed but no user was returned. Check if email confirmation is required.') };
      }

      console.log('[AuthContext] ===== SIGN UP SUCCESS =====');
      return { error: null };

    } catch (err) {
      console.error('[AuthContext] ===== SIGN UP EXCEPTION =====');
      console.error('[AuthContext] Error type:', err instanceof Error ? err.constructor.name : typeof err);
      console.error('[AuthContext] Error:', err);

      // Provide more helpful error messages
      const error = err as Error;
      if (error.message.includes('timeout')) {
        return {
          error: new Error('Sign up timed out. Please check your internet connection and try again.')
        };
      }

      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('[AuthContext] ===== SIGN IN CALLED =====');
    console.log('[AuthContext] Email:', email);
    console.log('[AuthContext] Timestamp:', new Date().toISOString());

    const startTime = Date.now();

    try {
      const { user: signedInUser, error } = await authApi.signIn(email, password);

      console.log(`[AuthContext] authApi.signIn completed in ${Date.now() - startTime}ms`);

      if (error) {
        console.error('[AuthContext] Sign in error:', error.message);
        return { error };
      }

      if (signedInUser) {
        console.log('[AuthContext] Sign in successful:', signedInUser.id);
        setUser(signedInUser);
      } else {
        console.error('[AuthContext] No user returned');
        return { error: new Error('Sign in completed but no user was returned.') };
      }

      console.log('[AuthContext] ===== SIGN IN SUCCESS =====');
      return { error: null };

    } catch (err) {
      console.error('[AuthContext] ===== SIGN IN EXCEPTION =====');
      console.error('[AuthContext] Error:', err);

      const error = err as Error;
      if (error.message.includes('timeout')) {
        return {
          error: new Error('Sign in timed out. Please check your internet connection and try again.')
        };
      }

      return { error };
    }
  };

  const signOut = async () => {
    console.log('[AuthContext] Signing out user');
    try {
      await authApi.signOut();
      setUser(null);
      console.log('[AuthContext] Sign out complete');
    } catch (err) {
      console.error('[AuthContext] Sign out error:', err);
      // Still clear user even if signOut API fails
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
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
