
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/course';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook to fetch course details
 */
export const useCourseDetails = () => {
  // Check if we're in a browser environment before using hooks
  if (typeof window === 'undefined') {
    return {
      course: null,
      isLoading: false,
      error: null
    };
  }

  const { id } = useParams<{ id: string }>();
  
  // Fetch course data
  const { 
    data: course, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');
      
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error('Invalid course ID format');
      }
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', numericId)
        .single();
      
      if (error) throw error;
      
      // Ensure the data matches our Course type
      return data as unknown as Course;
    },
    enabled: !!id,
  });

  // Show error messages
  useEffect(() => {
    if (error) {
      toast.error('Failed to load course details');
    }
  }, [error]);

  return {
    course,
    isLoading,
    error,
  };
};
