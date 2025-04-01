
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const useCourseProgress = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const {
    data: courseProgress = 0,
    isLoading,
    error,
    refetch: refetchProgress
  } = useQuery({
    queryKey: ['courseProgress', id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return 0;
      
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) return 0;

      try {
        // Fetch completed courses for the user
        const { data: completedCourses, error: completedCoursesError } = await supabase
          .from('course_completions')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', numericId)
          .maybeSingle();
        
        if (completedCoursesError) {
          console.error('Error fetching completed courses:', completedCoursesError);
          return 0;
        }

        // Fetch all chapters with their progress_when_finished values
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('id, progress_when_finished')
          .eq('course_id', numericId);
        
        if (chaptersError) {
          console.error('Error fetching chapters for progress:', chaptersError);
          return 0;
        }

        // Fetch completed chapters from user_chapter_progress
        const { data: completedChapters, error: progressError } = await supabase
          .from('user_chapter_progress')
          .select('chapter_id, finished')
          .eq('course_id', numericId)
          .eq('user_id', user.id)
          .eq('finished', true);
        
        if (progressError) {
          console.error('Error fetching user progress:', progressError);
          return 0;
        }

        // Calculate total progress based on completed chapters
        let totalProgress = 0;
        
        if (completedChapters && chaptersData) {
          completedChapters.forEach(progress => {
            if (progress.finished) {
              const chapter = chaptersData.find(c => c.id === progress.chapter_id);
              if (chapter && chapter.progress_when_finished !== null) {
                totalProgress += chapter.progress_when_finished;
              }
            }
          });
        }
        
        // If total progress is 100, check if course completion is already recorded
        if (totalProgress >= 100) {
          // If no record of course completion exists, insert one
          if (!completedCourses) {
            const { error: insertError } = await supabase
              .from('course_completions')
              .insert({
                user_id: user.id,
                course_id: numericId,
                completed_at: new Date().toISOString()
              });
            
            if (insertError) {
              console.error('Error inserting course completion:', insertError);
            }
          }
        }
        
        console.log('Calculated course progress:', totalProgress);
        return Math.min(totalProgress, 100);
      } catch (error) {
        console.error('Error in course progress calculation:', error);
        return 0;
      }
    },
    enabled: !!id && !!user?.id,
  });
  
  // Show error messages
  useEffect(() => {
    if (error) {
      console.error('Error fetching progress:', error);
    }
  }, [error]);

  return {
    courseProgress,
    isLoading,
    error,
    refetchProgress
  };
};
