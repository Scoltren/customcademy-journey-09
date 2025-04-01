
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCourseData } from '@/hooks/useCourseData';
import CourseHeader from '@/components/course/CourseHeader';
import CourseContent from '@/components/course/CourseContent';
import ReviewsSection from '@/components/course/ReviewsSection';
import LoadingState from '@/components/course/LoadingState';
import NotFoundState from '@/components/course/NotFoundState';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const CourseDetail = () => {
  const { course, chapters, comments, isLoading, courseProgress, refetchProgress, refetchComments } = useCourseData();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasShownCompletionMessage, setHasShownCompletionMessage] = useState(false);
  const [previousProgress, setPreviousProgress] = useState(0);

  // Setup progress refresh interval if refetch function is available
  useEffect(() => {
    if (refetchProgress) {
      const intervalId = setInterval(() => {
        refetchProgress();
      }, 5000);
      
      return () => clearInterval(intervalId);
    }
  }, [refetchProgress]);

  // Show a toast notification when progress reaches 100% for the first time
  useEffect(() => {
    const checkCourseCompletion = async () => {
      // Only proceed if we have a course and user
      if (!course || !user) return;

      try {
        // Check if course is already marked as completed
        const { data: completedCourses, error } = await supabase
          .from('course_completions')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', course.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error checking course completion:', error);
          return;
        }

        // Show completion toast only if course is fully completed and hasn't been shown before
        if (courseProgress === 100 && !completedCourses && !hasShownCompletionMessage) {
          toast.success('Congratulations! You completed the course!');
          setHasShownCompletionMessage(true);
        }
      } catch (error) {
        console.error('Error checking course completion:', error);
      }
    };

    checkCourseCompletion();
  }, [courseProgress, course, user, hasShownCompletionMessage]);

  // Render loading state if data is loading
  if (isLoading) {
    return <LoadingState />;
  }

  // Render not found state if course data is missing
  if (!course) {
    return <NotFoundState />;
  }

  return (
    <div className="min-h-screen bg-midnight">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Back to Dashboard Button */}
        {user && (
          <div className="container mx-auto px-6 mb-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
          </div>
        )}
        
        {/* Course Header */}
        <div className="container mx-auto px-6 mb-12 course-header">
          <CourseHeader course={course} />
        </div>
        
        {/* Course Content */}
        <CourseContent 
          chapters={chapters || []} 
          courseId={course.id}
          isLoading={isLoading}
          progress={courseProgress}
        />
        
        {/* Reviews */}
        <ReviewsSection 
          course={course} 
          comments={comments} 
          onCommentAdded={refetchComments}
          courseProgress={courseProgress}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetail;
