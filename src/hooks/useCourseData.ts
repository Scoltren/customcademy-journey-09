
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course, Chapter, Comment } from '@/types/course';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const useCourseData = () => {
  // Check if we're in a browser environment before using hooks
  if (typeof window === 'undefined') {
    return {
      course: null,
      chapters: [],
      comments: [],
      isLoading: false,
      courseError: null,
      chaptersError: null,
      commentsError: null
    };
  }

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
      console.log('Course data:', data);
      // Ensure the data matches our Course type
      return data as unknown as Course;
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
  
  // Fetch comments/reviews data
  const { 
    data: commentsData = [], 
    isLoading: commentsLoading, 
    error: commentsError 
  } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');
      
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error('Invalid course ID format');
      }
      
      // Fetch comments along with user data for display
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users:user_id (
            username
          )
        `)
        .eq('course_id', numericId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to include the username
      return data.map(comment => ({
        ...comment,
        username: comment.users?.username || 'Anonymous User'
      }));
    },
    enabled: !!id,
  });
  
  // Convert the commentsData to match our Comment type
  const comments: Comment[] = commentsData.map(comment => ({
    id: comment.id,
    comment_text: comment.comment_text,
    user_id: comment.user_id,
    created_at: comment.created_at,
    username: comment.username,
    users: comment.users
  }));
  
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
