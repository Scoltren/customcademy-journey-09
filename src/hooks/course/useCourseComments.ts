
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/types/course';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const useCourseComments = () => {
  const { id } = useParams<{ id: string }>();
  
  // Fetch comments/reviews data
  const { 
    data: commentsData = [], 
    isLoading, 
    error,
    refetch: refetchComments
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
        username: comment.users?.username || 'Anonymous User',
        // Ensure rating is included or defaulted
        rating: comment.rating || 0
      }));
    },
    enabled: !!id,
  });
  
  // Convert the commentsData to match our Comment type
  const comments: Comment[] = commentsData.map(comment => ({
    id: comment.id,
    comment_text: comment.comment_text || '', // Provide default for null values
    user_id: comment.user_id,
    created_at: comment.created_at,
    username: comment.username,
    users: comment.users,
    rating: comment.rating || 0 // Provide a default value if rating is undefined
  }));
  
  // Show error messages
  useEffect(() => {
    if (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load course reviews');
    }
  }, [error]);

  return {
    comments,
    isLoading,
    error,
    refetchComments
  };
};
