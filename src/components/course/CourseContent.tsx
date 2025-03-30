
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
  const [localProgress, setLocalProgress] = useState<number>(progress);
  const { id } = useParams<{ id: string }>();
  const { user, isEnrolled } = useAuth();
  const [userEnrolled, setUserEnrolled] = useState<boolean>(false);
  const navigate = useNavigate();

  // Update local progress state ONLY when the progress prop changes from the parent
  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (user && id) {
        const enrolled = await isEnrolled(id);
        setUserEnrolled(enrolled);
      }
    };

    checkEnrollment();
  }, [user, id, isEnrolled]);
  
  // Fetch completed chapters on initial load
  useEffect(() => {
    if (user && id) {
      fetchCompletedChapters();
    }
  }, [user, id]);

  const fetchCompletedChapters = async () => {
    if (!user || !id) return;
    
    try {
      const numericCourseId = parseInt(id, 10);
      if (isNaN(numericCourseId)) {
        throw new Error("Invalid ID format");
      }
      
      const { data, error } = await supabase
        .from('user_chapter_progress')
        .select('chapter_id')
        .eq('course_id', numericCourseId)
        .eq('user_id', user.id)
        .eq('finished', true);
      
      if (error) throw error;
      
      const finishedChapterIds = data?.map(item => item.chapter_id) || [];
      setCompletedChapters(finishedChapterIds);
    } catch (error) {
      console.error('Error fetching completed chapters:', error);
    }
  };
  
  // Toggle quiz visibility
  const handleToggleQuiz = (quizId: number | null) => {
    setActiveQuiz(activeQuiz === quizId ? null : quizId);
  };

  // Mark chapter as completed
  const handleMarkAsDone = async (chapterId: number, progressValue: number | null) => {
    if (!id || !user) {
      toast.error('You must be logged in to track progress');
      return;
    }
    
    try {
      // Make sure the id is converted to a number
      const numericCourseId = parseInt(id, 10);
      
      if (isNaN(numericCourseId)) {
        throw new Error("Invalid ID format");
      }
      
      // Check if chapter is already completed to avoid duplicate progress
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_chapter_progress')
        .select('finished')
        .eq('course_id', numericCourseId)
        .eq('user_id', user.id)
        .eq('chapter_id', chapterId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      // Only proceed if chapter is not already completed
      if (!existingProgress || !existingProgress.finished) {
        // Only update local progress if we have a valid progress value
        if (progressValue !== null && progressValue > 0) {
          // Apply the exact progress value directly - don't cumulate with previous state
          // This prevents the visual "jump" to an incorrect value
          setLocalProgress(prev => Math.min(prev + progressValue, 100));
        }

        // Update the user_chapter_progress table
        const { error: updateError } = await supabase
          .from('user_chapter_progress')
          .update({ finished: true })
          .eq('course_id', numericCourseId)
          .eq('user_id', user.id)
          .eq('chapter_id', chapterId);
        
        if (updateError) {
          // If update fails, check if the record exists
          const { data: existingRecord, error: checkError } = await supabase
            .from('user_chapter_progress')
            .select('*')
            .eq('course_id', numericCourseId)
            .eq('user_id', user.id)
            .eq('chapter_id', chapterId)
            .maybeSingle();
          
          if (checkError) throw checkError;
          
          // If record doesn't exist, insert it
          if (!existingRecord) {
            const { error: insertError } = await supabase
              .from('user_chapter_progress')
              .insert({
                course_id: numericCourseId,
                user_id: user.id,
                chapter_id: chapterId,
                finished: true
              });
            
            if (insertError) throw insertError;
          } else {
            throw updateError;
          }
        }
        
        // Update subscribed_courses table with new progress based on chapter's progress_when_finished
        if (progressValue !== null) {
          await updateCourseProgress(numericCourseId, user.id, progressValue);
        }
        
        // Update UI to show chapter as completed
        setCompletedChapters(prev => [...prev, chapterId]);
        toast.success("Chapter marked as completed!");
      } else {
        toast.info("Chapter already completed");
      }
      
    } catch (error) {
      console.error("Error marking chapter as completed:", error);
      toast.error("Failed to mark chapter as completed");
    }
  };
  
  const updateCourseProgress = async (courseId: number, userId: string, progressValue: number | null): Promise<number> => {
    try {
      // Get current progress
      const { data: currentProgress, error: progressError } = await supabase
        .from('subscribed_courses')
        .select('progress')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .single();
      
      if (progressError) throw progressError;
      
      // Calculate new progress with the exact value from progress_when_finished
      const currentValue = currentProgress?.progress || 0;
      const progressToAdd = progressValue || 0;
      const newProgress = Math.min(currentValue + progressToAdd, 100); // Cap at 100%
      
      // Update the progress in subscribed_courses
      const { error: updateError } = await supabase
        .from('subscribed_courses')
        .update({ progress: newProgress })
        .eq('course_id', courseId)
        .eq('user_id', userId);
      
      if (updateError) throw updateError;
      
      // Return the new progress value for local state update
      return newProgress;
      
    } catch (error) {
      console.error("Error updating course progress:", error);
      throw error;
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
        <CourseProgressBar progress={localProgress} />
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
