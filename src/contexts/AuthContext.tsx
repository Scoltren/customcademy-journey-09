
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  isEnrolled: (courseId: string | number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session on load
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error("Error checking session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signup = async (email: string, password: string, username: string) => {
    // Create the user in Supabase Auth
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (error) throw error;

    // If we successfully created the user, update the username in the users table
    if (data.user) {
      // The id from auth.users is a string, but our users table expects a number
      // We need to parse this id to a number or modify our db schema
      const numericId = parseInt(data.user.id, 10);
      
      if (isNaN(numericId)) {
        console.error("Error converting user ID to number");
        throw new Error("Invalid user ID format");
      }
      
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: numericId,
          username: username,
          email: email,
          created_at: new Date().toISOString(),
          password: '', // Placeholder, not storing actual password
          admin: false,
          profile_picture: null
        });

      if (profileError) throw profileError;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Check if a user is enrolled in a specific course
  const isEnrolled = async (courseId: string | number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Always convert courseId to a number for Supabase
      const parsedCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
      
      if (isNaN(parsedCourseId)) {
        console.error("Invalid course ID format");
        return false;
      }
      
      const { data, error } = await supabase
        .from('subscribed_courses')
        .select('*')
        .eq('course_id', parsedCourseId)
        .eq('user_id', parseInt(user.id, 10))
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error checking enrollment:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isEnrolled
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
