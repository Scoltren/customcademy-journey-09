
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const NotFoundState: React.FC = () => {
  return (
    <div className="min-h-screen bg-midnight">
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-16 text-center">
        <h1 className="heading-lg mb-6">Course Not Found</h1>
        <p className="text-slate-400 mb-8">The course you're looking for doesn't exist or has been removed.</p>
        <Link to="/courses" className="button-primary">Browse Courses</Link>
      </div>
      <Footer />
    </div>
  );
};

export default NotFoundState;
