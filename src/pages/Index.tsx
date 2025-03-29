
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Hero from '@/components/Hero';
import FeaturedCourses from '@/components/FeaturedCourses';
import CategorySection from '@/components/CategorySection';
import Footer from '@/components/Footer';
import UserDashboard from '@/components/home/UserDashboard';
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
      {!user ? (
        // Content for non-logged in users
        <>
          <Hero />
          <FeaturedCourses />
          <CategorySection />
        </>
      ) : (
        // Content for logged in users
        <UserDashboard userId={user.id} />
      )}
      <Footer />
    </div>
  );
};

export default Index;
