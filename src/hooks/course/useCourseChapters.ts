
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Chapter } from '@/types/course';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const useCourseChapters = () => {
  const { id } = useParams<{ id: string }>();
  
  // Fetch chapters data
  const { 
    data: chapters = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['chapters', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');
      
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error('Invalid course ID format');
      }
      
      console.log('Fetching chapters for course ID:', id);
      
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('course_id', numericId)
        .order('id', { ascending: true });
      
      if (error) {
        console.error('Error fetching chapters:', error);
        throw error;
      }
      
      console.log('Chapters data:', data);
      return data as Chapter[];
    },
    enabled: !!id,
  });
  
  // Show error messages
  useEffect(() => {
    if (error) {
      console.error('Error fetching chapters:', error);
      toast.error('Failed to load course chapters');
    }
  }, [error]);

  return {
    chapters,
    isLoading,
    error
  };
};
