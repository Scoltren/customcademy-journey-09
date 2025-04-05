
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, AuthError, AuthResponse } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Define types for context state
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean; // Added isLoading property
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, username: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  logout: () => Promise<{ error: AuthError | null }>; // Added logout alias
  login: (email: string, password: string) => Promise<AuthResponse>; // Added login alias
  signup: (email: string, password: string, username: string) => Promise<AuthResponse>; // Added signup alias
  isEnrolled: (courseId: string | number) => Promise<boolean>; // Changed to accept both string and number type
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isLoading: true, // Added isLoading property
  signIn: async () => ({ data: { user: null, session: null }, error: null }),
  signUp: async () => ({ data: { user: null, session: null }, error: null }),
  signOut: async () => ({ error: null }),
  logout: async () => ({ error: null }), // Added logout alias
  login: async () => ({ data: { user: null, session: null }, error: null }), // Added login alias
  signup: async () => ({ data: { user: null, session: null }, error: null }), // Added signup alias
  isEnrolled: async () => false
});

// Hook for using auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps app and makes auth object available
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state from stored session
  useEffect(() => {
    // Get current session and set the user
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for authentication state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.signInWithPassword({ email, password });
      if (response.error) throw response.error;
      return response;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  /**
   * Sign up with email, password and username
   */
  const signUp = async (email: string, password: string, username: string): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });
      
      if (response.error) throw response.error;
      return response;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      const response = await supabase.auth.signOut();
      if (response.error) throw response.error;
      return response;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  /**
   * Check if user is enrolled in a specific course
   */
  const isEnrolled = async (courseId: string | number): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error, count } = await supabase
        .from('subscribed_courses')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('course_id', typeof courseId === 'string' ? parseInt(courseId) : courseId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  };

  // Define value to provide through context
  const value = {
    user,
    session,
    loading,
    isLoading: loading, // Added isLoading as alias to loading
    signIn,
    signUp,
    signOut,
    // Add aliases for compatibility with existing code
    login: signIn,
    signup: signUp,
    logout: signOut,
    isEnrolled
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
