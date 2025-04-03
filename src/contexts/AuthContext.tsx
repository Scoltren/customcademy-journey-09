
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<{ user: User | null, needsEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  isEnrolled: (courseId: string | number) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    // Sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username, // Store username in user metadata
        },
      },
    });

    if (error) {
      throw error;
    }

    // Check if the user needs email confirmation
    const needsEmailConfirmation = !data?.session;

    // After signup, check if the user was created successfully
    // The trigger should automatically create a record in public.users
    if (data.user) {
      try {
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify the user exists in the public.users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', data.user.id)
          .single();
          
        if (userError) {
          console.error('Error verifying user creation:', userError);
          throw new Error('Failed to complete user registration');
        }
        
        console.log('User successfully created:', userData);
      } catch (err) {
        console.error('Error in signup verification:', err);
        throw err;
      }
    }

    return { user: data.user, needsEmailConfirmation };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const isEnrolled = async (courseId: string | number) => {
    if (!user) return false;
    
    try {
      // For course_id, convert to number since that's what the database expects
      const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
      
      // For user_id, we'll use the auth_user_id which is a string (UUID)
      const { data, error } = await supabase
        .from('subscribed_courses')
        .select('*')
        .eq('user_id', user.id) // user.id is the auth_user_id (UUID as string)
        .eq('course_id', numericCourseId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking enrollment status:', error);
        return false;
      }
      
      return !!data;
    } catch (err) {
      console.error('Error in isEnrolled:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading: loading, login, signup, logout, isEnrolled }}>
      {!loading && children}
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
