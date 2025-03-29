import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
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
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      throw error;
    }

    // If successful, can insert additional user data to a profiles table if needed
    if (data.user) {
      try {
        // Optional: insert into a profiles table if you have one
        // const { error: profileError } = await supabase
        //   .from('profiles')
        //   .insert([{ id: data.user.id, username }]);
        
        // if (profileError) throw profileError;
      } catch (err) {
        console.error('Error creating profile:', err);
      }
    }
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
      // Convert both IDs to numbers for consistency
      const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
      const numericUserId = parseInt(user.id, 10);
      
      if (isNaN(numericCourseId) || isNaN(numericUserId)) {
        console.error("Invalid ID format in isEnrolled check");
        return false;
      }
      
      const { data, error } = await supabase
        .from('subscribed_courses')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
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
    <AuthContext.Provider value={{ user, session, login, signup, logout, isEnrolled }}>
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
