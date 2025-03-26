
import React from 'react';
import Hero from '@/components/Hero';
import FeaturedCourses from '@/components/FeaturedCourses';
import CategorySection from '@/components/CategorySection';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, Award, BookOpen } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-midnight">
      <Navbar />
      
      <main>
        <Hero />
        
        <FeaturedCourses />
        
        <CategorySection />
        
        {/* How It Works Section */}
        <section className="section-padding">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <span className="inline-block py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20 text-sm font-medium mb-4">
                How CustomCademy Works
              </span>
              <h2 className="heading-lg mx-auto max-w-3xl">
                Your <span className="text-gradient">Personalized</span> Learning Journey
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center glass-card p-8 relative animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
                <div className="absolute -top-10 w-20 h-20 rounded-full bg-gradient-to-r from-blue to-sky flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mt-8 mb-4 text-white">Choose Your Interests</h3>
                <p className="text-slate-400">
                  Select up to three interest categories to personalize your learning experience. Your dashboard will be tailored to your preferences.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center glass-card p-8 relative animate-fade-in opacity-0" style={{ animationDelay: '0.3s' }}>
                <div className="absolute -top-10 w-20 h-20 rounded-full bg-gradient-to-r from-blue to-sky flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mt-8 mb-4 text-white">Take a Diagnostic Quiz</h3>
                <p className="text-slate-400">
                  Complete a short assessment for each selected category to determine your skill level and get course recommendations.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center glass-card p-8 relative animate-fade-in opacity-0" style={{ animationDelay: '0.5s' }}>
                <div className="absolute -top-10 w-20 h-20 rounded-full bg-gradient-to-r from-blue to-sky flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mt-8 mb-4 text-white">Learn at Your Own Pace</h3>
                <p className="text-slate-400">
                  Access personalized course recommendations, track your progress, and advance your skills at a pace that works for you.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link to="/signup" className="button-primary inline-flex">Start Your Journey</Link>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="section-padding bg-navy/50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20 text-sm font-medium mb-4">
                  Why Choose CustomCademy
                </span>
                <h2 className="heading-lg mb-6">
                  Benefits of Our <span className="text-gradient">Learning Platform</span>
                </h2>
                <p className="text-slate-400 mb-8">
                  CustomCademy offers a truly personalized learning experience that adapts to your skill level and interests. 
                  Our platform is designed to help you achieve your learning goals efficiently and effectively.
                </p>
                
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <CheckCircle className="text-blue-light flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h3 className="text-lg font-medium text-white">Personalized Learning Path</h3>
                      <p className="text-slate-400">Courses recommended based on your interests and skill level</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="text-blue-light flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h3 className="text-lg font-medium text-white">Expert Instructors</h3>
                      <p className="text-slate-400">Learn from industry professionals with years of experience</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="text-blue-light flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h3 className="text-lg font-medium text-white">Interactive Learning</h3>
                      <p className="text-slate-400">Engage with hands-on projects and practical assignments</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="text-blue-light flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h3 className="text-lg font-medium text-white">Progress Tracking</h3>
                      <p className="text-slate-400">Monitor your advancement with detailed analytics and insights</p>
                    </div>
                  </li>
                </ul>
                
                <div className="mt-8">
                  <Link to="/about" className="button-secondary inline-flex">Learn More</Link>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="glass-card p-8 text-center animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
                  <div className="w-16 h-16 bg-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="text-blue-light" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">500+</h3>
                  <p className="text-slate-400">Courses Available</p>
                </div>
                
                <div className="glass-card p-8 text-center animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
                  <div className="w-16 h-16 bg-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-blue-light" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">10k+</h3>
                  <p className="text-slate-400">Active Students</p>
                </div>
                
                <div className="glass-card p-8 text-center animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
                  <div className="w-16 h-16 bg-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="text-blue-light" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">100+</h3>
                  <p className="text-slate-400">Expert Instructors</p>
                </div>
                
                <div className="glass-card p-8 text-center animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
                  <div className="w-16 h-16 bg-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-blue-light" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">5k+</h3>
                  <p className="text-slate-400">Course Completions</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="glass-card relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue/20 to-transparent z-0"></div>
              <div className="relative z-10 p-12 md:p-16 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="max-w-lg">
                  <h2 className="heading-lg mb-4">Ready to Start Your Learning Journey?</h2>
                  <p className="text-slate-300 mb-6">
                    Join thousands of students already learning on CustomCademy. 
                    Get started today with a free account.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/signup" className="button-primary">Sign Up Now</Link>
                    <Link to="/courses" className="button-secondary">Browse Courses</Link>
                  </div>
                </div>
                
                <div className="w-64 h-64 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-blue/30 animate-spin" style={{ animationDuration: '30s' }}></div>
                  <div className="absolute inset-4 rounded-full border-4 border-dashed border-blue/20 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }}></div>
                  <div className="absolute inset-8 rounded-full border-4 border-dashed border-blue/10 animate-spin" style={{ animationDuration: '15s' }}></div>
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
