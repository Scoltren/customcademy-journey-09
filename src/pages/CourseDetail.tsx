import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCourseData } from '@/hooks/useCourseData';
import CourseHeader from '@/components/course/CourseHeader';
import CourseContent from '@/components/course/CourseContent';
import ReviewsSection from '@/components/course/ReviewsSection';
import LoadingState from '@/components/course/LoadingState';
import NotFoundState from '@/components/course/NotFoundState';

const CourseDetail = () => {
  const { course, chapters, comments, isLoading, courseProgress, refetchProgress } = useCourseData();

  useEffect(() => {
    if (refetchProgress) {
      const intervalId = setInterval(() => {
        refetchProgress();
      }, 5000);
      
      return () => clearInterval(intervalId);
    }
  }, [refetchProgress]);

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
