
import React from 'react';
import Hero from '@/components/Hero';
import FeaturedCourses from '@/components/FeaturedCourses';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-midnight">
      <Navbar />
      
      <main>
        <Hero />
        
        <FeaturedCourses />
        
        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="glass-card relative overflow-hidden">
              <div className="relative z-10 p-12 md:p-16 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="max-w-lg">
                  <h2 className="heading-lg mb-4">Ready to Start Your Learning Journey?</h2>
                  <p className="text-slate-300 mb-6">
                    Join thousands of students already learning on CustomCademy. 
                    Get started today with a free account.
                  </p>
                  <div>
                    <Link to="/signup" className="button-primary">Sign Up Now</Link>
                  </div>
                </div>
                
                <div className="w-64 h-64 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue to-sky flex items-center justify-center shadow-lg">
                      <span className="text-white text-4xl font-bold">C</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
