
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-midnight">
      <Navbar />
      <div className="container mx-auto px-6 py-28 pb-16">
        <div className="animate-pulse">
          <div className="h-10 bg-slate-800 rounded mb-4 w-3/4"></div>
          <div className="h-6 bg-slate-800 rounded mb-6 w-1/2"></div>
          <div className="glass-card h-96"></div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoadingState;
