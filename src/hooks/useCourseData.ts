
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course, Chapter, Comment } from '@/types/course';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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
      commentsError: null,
      courseProgress: 0
    };
  }

  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
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
  
  // Fetch user chapter progress
  const {
    data: courseProgress = 0,
    isLoading: progressLoading,
    error: progressError
  } = useQuery({
    queryKey: ['courseProgress', id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return 0;
      
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) return 0;

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
        .eq('user_id', user.id);
      
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
            if (chapter && chapter.progress_when_finished) {
              totalProgress += chapter.progress_when_finished;
            }
          }
        });
      }
      
      console.log('Calculated course progress:', totalProgress);
      return Math.min(totalProgress, 100);
    },
    enabled: !!id && !!user?.id,
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

    if (progressError) {
      console.error('Error fetching progress:', progressError);
    }
  }, [courseError, chaptersError, commentsError, progressError]);

  const isLoading = courseLoading || chaptersLoading || commentsLoading || progressLoading;

  return {
    course,
    chapters,
    comments,
    isLoading,
    courseError,
    chaptersError,
    commentsError,
    courseProgress
  };
};
