
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
      
      // Calculate progress based on completed chapters
      if (chapters.length > 0) {
        const completionPercentage = (finishedChapterIds.length / chapters.length) * 100;
        setLocalProgress(completionPercentage);
      }
      
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
      
      // Update subscribed_courses table with new progress percentage
      await updateCourseProgress(numericCourseId, user.id);
      
      // Update UI to show chapter as completed
      setCompletedChapters(prev => [...prev, chapterId]);
      toast.success("Chapter marked as completed!");
      
      // Refetch completed chapters to update the UI
      fetchCompletedChapters();
      
    } catch (error) {
      console.error("Error marking chapter as completed:", error);
      toast.error("Failed to mark chapter as completed");
    }
  };
  
  const updateCourseProgress = async (courseId: number, userId: string) => {
    try {
      // First, get the total number of chapters in the course
      const { data: totalChapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('id')
        .eq('course_id', courseId);
      
      if (chaptersError) throw chaptersError;
      
      // Get the number of completed chapters
      const { data: completedChapters, error: completedError } = await supabase
        .from('user_chapter_progress')
        .select('chapter_id')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .eq('finished', true);
      
      if (completedError) throw completedError;
      
      // Calculate progress percentage
      const totalCount = totalChapters?.length || 0;
      const completedCount = completedChapters?.length || 0;
      const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      // Update the progress in subscribed_courses
      const { error: updateError } = await supabase
        .from('subscribed_courses')
        .update({ progress: progressPercentage })
        .eq('course_id', courseId)
        .eq('user_id', userId);
      
      if (updateError) throw updateError;
      
      // Update local state for the progress bar
      setLocalProgress(progressPercentage);
      
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
