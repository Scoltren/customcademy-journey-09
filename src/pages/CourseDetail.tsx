
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

const CourseDetail = () => {
  const { course, chapters, comments, isLoading, courseProgress, refetchProgress, refetchComments } = useCourseData();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Setup progress refresh interval if refetch function is available
  useEffect(() => {
    if (refetchProgress) {
      const intervalId = setInterval(() => {
        refetchProgress();
      }, 5000);
      
      return () => clearInterval(intervalId);
    }
  }, [refetchProgress]);

  // Show a toast notification when progress reaches 100%
  // This will show every time the component mounts if progress is 100%
  useEffect(() => {
    if (user && course && courseProgress === 100) {
      // Show completion message every time for completed courses
      toast.success('Congratulations! You completed the course!');
    }
  }, [courseProgress, course, user]);

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
