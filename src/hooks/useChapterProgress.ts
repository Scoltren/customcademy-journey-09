
// This file would need to be created with comments if it doesn't exist
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Custom hook to manage chapter progress tracking for a course
 * @param userId The ID of the current user
 * @param courseId The ID of the course
 */
export const useChapterProgress = (userId?: string, courseId?: string | number) => {
  // State for tracking completed chapters and overall progress
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [localProgress, setLocalProgress] = useState<number>(0);
  const [totalChapters, setTotalChapters] = useState<number>(0);
  
  // Fetch completed chapters when component mounts or dependencies change
  useEffect(() => {
    if (userId && courseId) {
      fetchCompletedChapters();
      fetchTotalChapters();
    }
  }, [userId, courseId]);
  
  // Function to fetch completed chapters from database
  const fetchCompletedChapters = async () => {
    try {
      // Query completed chapters for this user and course
      const { data, error } = await supabase
        .from('user_chapter_progress')
        .select('chapter_id')
        .eq('user_id', userId)
        .eq('course_id', typeof courseId === 'string' ? parseInt(courseId) : courseId)
        .eq('finished', true);
      
      if (error) throw error;
      
      // Extract chapter IDs from result
      const chapterIds = data.map(item => item.chapter_id);
      setCompletedChapters(chapterIds);
    } catch (error) {
      console.error('Error fetching completed chapters:', error);
    }
  };
  
  // Function to fetch total number of chapters in the course
  const fetchTotalChapters = async () => {
    try {
      // Count total chapters for this course
      const { count, error } = await supabase
        .from('chapters')
        .select('id', { count: 'exact' })
        .eq('course_id', typeof courseId === 'string' ? parseInt(courseId) : courseId);
      
      if (error) throw error;
      
      setTotalChapters(count || 0);
    } catch (error) {
      console.error('Error fetching total chapters:', error);
    }
  };
  
  // Function to mark a chapter as complete or incomplete
  const markChapterAsDone = useCallback(async (chapterId: number, progressValue: number | null) => {
    if (!userId || !courseId) {
      toast.error('You must be logged in to track progress');
      return;
    }
    
    try {
      // Determine if marking chapter as complete or incomplete
      const isCompleting = progressValue !== null;
      
      // Update chapter progress in database
      const { error } = await supabase
        .from('user_chapter_progress')
        .upsert({
          user_id: userId,
          chapter_id: chapterId,
          course_id: typeof courseId === 'string' ? parseInt(courseId) : courseId,
          finished: isCompleting
        });
      
      if (error) throw error;
      
      // Update local state based on completion status
      if (isCompleting) {
        setCompletedChapters(prev => [...prev, chapterId]);
        
        // Also update course progress if provided
        if (progressValue !== null) {
          updateCourseProgress(progressValue);
          setLocalProgress(progressValue);
        }
        
        toast.success('Progress saved!');
      } else {
        // Remove chapter from completed list if unmarking
        setCompletedChapters(prev => prev.filter(id => id !== chapterId));
        
        // Recalculate progress when unmarking chapter
        const newProgress = Math.max(0, Math.min(100, localProgress - (100 / totalChapters)));
        updateCourseProgress(newProgress);
        setLocalProgress(newProgress);
        
        toast.info('Chapter marked as incomplete');
      }
    } catch (error) {
      console.error('Error updating chapter progress:', error);
      toast.error('Failed to update progress');
    }
  }, [userId, courseId, totalChapters, localProgress]);
  
  // Function to update overall course progress
  const updateCourseProgress = async (progress: number) => {
    try {
      // Update course progress in subscribed_courses table
      const { error } = await supabase
        .from('subscribed_courses')
        .update({ progress })
        .eq('user_id', userId)
        .eq('course_id', typeof courseId === 'string' ? parseInt(courseId) : courseId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating course progress:', error);
    }
  };
  
  return {
    completedChapters,
    localProgress,
    setLocalProgress,
    markChapterAsDone,
  };
};
