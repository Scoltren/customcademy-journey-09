
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
  const { id } = useParams<{ id: string }>();
  
  // Fetch course data - moved the query outside the conditional
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
    // Using enabled to prevent query execution when id is not available
    enabled: !!id,
  });

  // Show error messages
  useEffect(() => {
    if (error) {
      toast.error('Failed to load course details');
    }
  }, [error]);

  return {
    course: course ?? null,
    isLoading,
    error,
  };
};
