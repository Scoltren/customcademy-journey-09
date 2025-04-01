
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Hero from '@/components/Hero';
import FeaturedCourses from '@/components/FeaturedCourses';
import UserDashboard from '@/components/home/UserDashboard';
import { Loader2 } from 'lucide-react';

/**
 * Main landing page component
 * Shows either a public landing page or user dashboard based on auth state
 */
const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      <div className="w-full"> {/* Removed the pt-16 since we added it to main in App.tsx */}
        {!user ? (
          // Content for non-logged in users
          <>
            <Hero />
            <FeaturedCourses />
          </>
        ) : (
          // Content for logged in users
          <UserDashboard userId={user.id} key={Date.now()} />
        )}
      </div>
    </div>
  );
};

export default Index;
