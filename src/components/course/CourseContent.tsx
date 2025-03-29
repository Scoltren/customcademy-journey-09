
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Chapter } from '@/types/course';

// Import refactored components
import ChapterList from './content/ChapterList';
import LoadingChapters from './content/LoadingChapters';
import EnrollmentRequired from './content/EnrollmentRequired';
import CourseProgressBar from './content/CourseProgressBar';

interface CourseContentProps {
  chapters: Chapter[];
  courseId?: number;
  isLoading?: boolean;
  progress?: number;
}

const CourseContent: React.FC<CourseContentProps> = ({ 
  chapters, 
  courseId,
  isLoading = false,
  progress = 0
}) => {
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const { id } = useParams<{ id: string }>();
  const { user, isEnrolled } = useAuth();
  const [userEnrolled, setUserEnrolled] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEnrollment = async () => {
      if (user && id) {
        const enrolled = await isEnrolled(id);
        setUserEnrolled(enrolled);
      }
    };

    checkEnrollment();
  }, [user, id, isEnrolled]);
  
  // Toggle quiz visibility
  const handleToggleQuiz = (quizId: number | null) => {
    setActiveQuiz(activeQuiz === quizId ? null : quizId);
  };

  // Mark chapter as completed
  const handleMarkAsDone = async (chapterId: number, progressValue: number | null) => {
    if (!id || !progressValue || !user) {
      toast.error('You must be logged in to track progress');
      return;
    }
    
    try {
      // Make sure the id is converted to a number
      const numericCourseId = parseInt(id, 10);
      
      if (isNaN(numericCourseId)) {
        throw new Error("Invalid ID format");
      }
      
      // First check if user is already subscribed to this course
      const { data: existingSubscription, error: checkError } = await supabase
        .from('subscribed_courses')
        .select('*')
        .eq('course_id', numericCourseId)
        .eq('user_id', user.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingSubscription) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('subscribed_courses')
          .update({ 
            progress: (existingSubscription.progress || 0) + progressValue 
          })
          .eq('course_id', numericCourseId)
          .eq('user_id', user.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new subscription
        const { error: insertError } = await supabase
          .from('subscribed_courses')
          .insert({
            course_id: numericCourseId,
            user_id: user.id,
            progress: progressValue
          });
        
        if (insertError) throw insertError;
      }
      
      // Update UI to show chapter as completed
      setCompletedChapters(prev => [...prev, chapterId]);
      toast.success("Chapter marked as completed!");
      
    } catch (error) {
      console.error("Error marking chapter as completed:", error);
      toast.error("Failed to mark chapter as completed");
    }
  };

  const handleLoginRedirect = () => {
    toast.info('Please log in to access course content');
    navigate('/login');
  };

  const handleEnrollRedirect = () => {
    toast.info('You need to enroll in this course to access its content');
    const courseSection = document.querySelector('.course-header');
    if (courseSection) {
      courseSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return <LoadingChapters />;
  }

  if (!user) {
    return <EnrollmentRequired type="login" onEnrollClick={handleLoginRedirect} />;
  }

  if (!userEnrolled) {
    return <EnrollmentRequired type="enroll" onEnrollClick={handleEnrollRedirect} />;
  }

  return (
    <section className="container mx-auto px-6 mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading-md">Course Content</h2>
        <CourseProgressBar progress={progress} />
      </div>
      
      <ChapterList 
        chapters={chapters}
        activeQuiz={activeQuiz}
        completedChapters={completedChapters}
        onToggleQuiz={handleToggleQuiz}
        onMarkAsDone={handleMarkAsDone}
      />
    </section>
  );
};

export default CourseContent;
