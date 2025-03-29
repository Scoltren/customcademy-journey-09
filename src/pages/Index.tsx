
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Hero from '@/components/Hero';
import FeaturedCourses from '@/components/FeaturedCourses';
import Footer from '@/components/Footer';
import UserDashboard from '@/components/home/UserDashboard';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16"> {/* Add padding to prevent content from being hidden behind fixed navbar */}
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
      <Footer />
    </div>
  );
};

export default Index;
