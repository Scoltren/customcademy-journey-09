import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/course';
import { toast } from 'sonner';

// Import the dashboard components
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import MyLearningTab from '@/components/dashboard/tabs/MyLearningTab';
import QuizResultsTab from '@/components/dashboard/tabs/QuizResultsTab';
import ProfileTab from '@/components/dashboard/tabs/ProfileTab';
import SettingsTab from '@/components/dashboard/tabs/SettingsTab';

interface UserInterest {
  category_id: number;
  user_id: string;
  category?: {
    name: string;
  }
}

interface QuizResult {
  id: number;
  quiz_id: number;
  score: number;
  user_id: string;
  quiz?: {
    title: string;
    category_id: number;
    category?: {
      name: string;
    }
  }
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('my-learning');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [enrolledCourses, setEnrolledCourses] = useState<(Course & {progress: number, completedChapters: number, totalChapters: number})[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchUserData();
  }, [user, activeTab]);
  
  const fetchUserData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch user interests with category names
      const { data: interests, error: interestsError } = await supabase
        .from('user_interest_categories')
        .select('*, category:categories(name)')
        .eq('user_id', user?.id || '');
      
      if (interestsError) throw interestsError;
      setUserInterests(interests || []);
      
      // Fetch enrolled courses with progress
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscribed_courses')
        .select('*, course:course_id(id, title, description, thumbnail, difficulty_level, media, course_time, creator_id, overall_rating, price, category_id, created_at)')
        .eq('user_id', user?.id || '');
      
      if (subscriptionsError) throw subscriptionsError;
      
      if (subscriptions && subscriptions.length > 0) {
        const coursesWithDetails = await Promise.all(
          subscriptions.map(async (sub) => {
            const { data: chapters, error: chaptersError } = await supabase
              .from('chapters')
              .select('*')
              .eq('course_id', sub.course_id);
            
            if (chaptersError) throw chaptersError;
            
            // Create a properly typed course object by explicitly casting
            const courseWithProgress: Course & {progress: number, completedChapters: number, totalChapters: number} = {
              ...sub.course as unknown as Course,
              progress: sub.progress || 0,
              completedChapters: Math.floor((chapters?.length || 0) * ((sub.progress || 0) / 100)),
              totalChapters: chapters?.length || 0
            };
            
            return courseWithProgress;
          })
        );
        
        setEnrolledCourses(coursesWithDetails);
      } else {
        setEnrolledCourses([]);
      }
      
      // Fetch quiz results
      const { data: quizzes, error: quizzesError } = await supabase
        .from('user_quiz_results')
        .select('*, quiz:quiz_id(title, category_id, category:category_id(name))')
        .eq('user_id', user?.id || '');
      
      if (quizzesError) throw quizzesError;
      setQuizResults(quizzes || []);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load your data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditInterests = () => {
    navigate('/select-interests');
  };
  
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
