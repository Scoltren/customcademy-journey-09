
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Award } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight via-midnight to-navy z-0"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20 text-sm font-medium mb-6">
              Transform Your Learning Journey
            </span>
            <h1 className="heading-xl mb-6">
              <span className="text-gradient">Personalized</span> Learning Experience for Everyone
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-lg">
              Discover courses tailored to your interests and skill level. 
              Learn at your own pace and track your progress with CustomCademy's 
              intuitive learning platform.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/courses" className="button-primary flex items-center gap-2">
                Explore Courses <ArrowRight size={18} />
              </Link>
              <Link to="/signup" className="button-secondary flex items-center gap-2">
                Get Started
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue/10 text-blue-light">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">500+</h3>
                  <p className="text-slate-400">Courses</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue/10 text-blue-light">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">10k+</h3>
                  <p className="text-slate-400">Students</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue/10 text-blue-light">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">100+</h3>
                  <p className="text-slate-400">Instructors</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hero image */}
          <div className="relative hidden lg:block">
            <div className="glass-card p-6 relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Learning platform" 
                className="w-full h-auto rounded-lg shadow-soft"
              />
              
              {/* Floating elements */}
              <div className="absolute -top-8 -left-8 glass-card px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-dark flex items-center justify-center text-white text-sm font-bold">85%</div>
                  <p className="text-sm text-white">Course Completion</p>
                </div>
              </div>
              
              <div className="absolute -bottom-8 -right-8 glass-card px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-dark flex items-center justify-center text-white text-sm font-bold">4.9</div>
                  <div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-500">★</span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">1,200+ Reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
