
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import MyLearningTab from '@/components/dashboard/tabs/MyLearningTab';
import QuizResultsTab from '@/components/dashboard/tabs/QuizResultsTab';
import ProfileTab from '@/components/dashboard/tabs/ProfileTab';
import SettingsTab from '@/components/dashboard/tabs/SettingsTab';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('my-learning');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    enrolledCourses,
    quizResults,
    userInterests,
    isLoading,
    handleEditInterests
  } = useDashboardData(user?.id);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  if (!user) {
    return null; // Will redirect to login in useEffect
  }
  
  return (
    <div className="min-h-screen bg-midnight">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Component */}
            <DashboardSidebar 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              userInterests={userInterests}
              enrolledCourses={enrolledCourses}
              handleEditInterests={handleEditInterests}
            />
            
            {/* Main Content */}
            <div className="flex-grow">
              {/* My Learning Tab */}
              {activeTab === 'my-learning' && (
                <MyLearningTab 
                  enrolledCourses={enrolledCourses}
                  isLoading={isLoading}
                  userInterests={userInterests}
                  handleEditInterests={handleEditInterests}
                />
              )}
              
              {/* Quiz Results Tab */}
              {activeTab === 'quiz-results' && (
                <QuizResultsTab 
                  quizResults={quizResults}
                  isLoading={isLoading}
                />
              )}
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <ProfileTab 
                  userInterests={userInterests}
                  handleEditInterests={handleEditInterests}
                />
              )}
              
              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <SettingsTab />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
