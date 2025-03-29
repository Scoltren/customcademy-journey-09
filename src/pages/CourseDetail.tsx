
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCourseData } from '@/hooks/useCourseData';
import CourseHeader from '@/components/course/CourseHeader';
import CourseContent from '@/components/course/CourseContent';
import ReviewsSection from '@/components/course/ReviewsSection';
import LoadingState from '@/components/course/LoadingState';
import NotFoundState from '@/components/course/NotFoundState';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

const CourseDetail = () => {
  const { course, chapters, comments, isLoading } = useCourseData();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [courseProgress, setCourseProgress] = useState<number>(0);
  
  useEffect(() => {
    // Fetch course progress if user is logged in
    const fetchProgress = async () => {
      if (user && id) {
        try {
          const numericCourseId = parseInt(id, 10);
          
          if (isNaN(numericCourseId)) {
            console.error("Invalid ID format");
            return;
          }
          
          const { data, error } = await supabase
            .from('subscribed_courses')
            .select('progress')
            .eq('course_id', numericCourseId)
            .eq('user_id', user.id)
            .single();
          
          if (error) throw error;
          setCourseProgress(data?.progress || 0);
        } catch (error) {
          console.error('Error fetching course progress:', error);
        }
      }
    };
    
    fetchProgress();
  }, [user, id]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!course) {
    return <NotFoundState />;
  }

  return (
    <div className="min-h-screen bg-midnight">
      <Navbar />
      
      <main className="pt-24 pb-16">
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
        <ReviewsSection course={course} comments={comments} />
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetail;
