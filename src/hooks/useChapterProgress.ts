
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Chapter } from '@/types/course';

export function useChapterProgress(userId: string | undefined, courseId: string | undefined) {
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [localProgress, setLocalProgress] = useState<number>(0);

  // Fetch completed chapters on initial load
  useEffect(() => {
    if (userId && courseId) {
      fetchCompletedChapters();
    }
  }, [userId, courseId]);

  const fetchCompletedChapters = async () => {
    if (!userId || !courseId) return;
    
    try {
      const numericCourseId = parseInt(courseId, 10);
      if (isNaN(numericCourseId)) {
        throw new Error("Invalid ID format");
      }
      
      const { data, error } = await supabase
        .from('user_chapter_progress')
        .select('chapter_id')
        .eq('course_id', numericCourseId)
        .eq('user_id', userId)
        .eq('finished', true);
      
      if (error) throw error;
      
      const finishedChapterIds = data?.map(item => item.chapter_id) || [];
      setCompletedChapters(finishedChapterIds);
    } catch (error) {
      console.error('Error fetching completed chapters:', error);
    }
  };

  // Mark chapter as completed
  const markChapterAsDone = async (chapterId: number, progressValue: number | null) => {
    if (!courseId || !userId) {
      toast.error('You must be logged in to track progress');
      return;
    }
    
    try {
      // Make sure the id is converted to a number
      const numericCourseId = parseInt(courseId, 10);
      
      if (isNaN(numericCourseId)) {
        throw new Error("Invalid ID format");
      }
      
      // Check if chapter is already completed to avoid duplicate progress
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_chapter_progress')
        .select('finished')
        .eq('course_id', numericCourseId)
        .eq('user_id', userId)
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
          .eq('user_id', userId)
          .eq('chapter_id', chapterId);
        
        if (updateError) {
          // If update fails, check if the record exists
          const { data: existingRecord, error: checkError } = await supabase
            .from('user_chapter_progress')
            .select('*')
            .eq('course_id', numericCourseId)
            .eq('user_id', userId)
            .eq('chapter_id', chapterId)
            .maybeSingle();
          
          if (checkError) throw checkError;
          
          // If record doesn't exist, insert it
          if (!existingRecord) {
            const { error: insertError } = await supabase
              .from('user_chapter_progress')
              .insert({
                course_id: numericCourseId,
                user_id: userId,
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
          await updateCourseProgress(numericCourseId, userId, progressValue);
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

  return {
    completedChapters,
    localProgress,
    setLocalProgress,
    markChapterAsDone
  };
}
