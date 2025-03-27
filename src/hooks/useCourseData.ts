
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course, Chapter, Comment } from '@/types/course';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const useCourseData = () => {
  const { id } = useParams<{ id: string }>();
  
  // Fetch course data
  const { 
    data: course, 
    isLoading: courseLoading, 
    error: courseError 
  } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', parseInt(id, 10))
        .single();
      
      if (error) throw error;
      return data as Course;
    },
    enabled: !!id,
  });
  
  // Fetch chapters data
  const { 
    data: chapters = [], 
    isLoading: chaptersLoading, 
    error: chaptersError 
  } = useQuery({
    queryKey: ['chapters', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');
      
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('course_id', parseInt(id, 10))
        .order('id', { ascending: true });
      
      if (error) throw error;
      return data as Chapter[];
    },
    enabled: !!id,
  });
  
  // Fetch comments/reviews data
  const { 
    data: comments = [], 
    isLoading: commentsLoading, 
    error: commentsError 
  } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');
      
      // Fetch comments along with user data for display
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users:user_id (
            username
          )
        `)
        .eq('course_id', parseInt(id, 10))
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to include the username
      return data.map(comment => ({
        ...comment,
        username: comment.users?.username || 'Anonymous User'
      })) as Comment[];
    },
    enabled: !!id,
  });
  
  // Show error messages
  useEffect(() => {
    if (courseError) {
      console.error('Error fetching course:', courseError);
      toast.error('Failed to load course details');
    }
    
    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError);
      toast.error('Failed to load course chapters');
    }
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      toast.error('Failed to load course reviews');
    }
  }, [courseError, chaptersError, commentsError]);

  const isLoading = courseLoading || chaptersLoading || commentsLoading;

  return {
    course,
    chapters,
    comments,
    isLoading,
    courseError,
    chaptersError,
    commentsError
  };
};
