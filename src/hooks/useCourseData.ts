
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course, Chapter, Comment } from '@/types/course';
import { useEffect } from 'react';
import { toast } from 'sonner';

// Sample chapters for debugging when no chapters exist
const sampleChapters = [
  {
    id: 1001,
    title: "Introduction to HTML",
    chapter_text: "Learn the fundamentals of HTML structure, tags, and semantic elements. This chapter covers document structure, headings, paragraphs, links, and more.",
    video_link: "https://example.com/intro-html",
    course_id: 20
  },
  {
    id: 1002,
    title: "CSS Styling Basics",
    chapter_text: "Master the basics of CSS including selectors, properties, the box model, and responsive design principles.",
    video_link: "https://example.com/css-basics",
    course_id: 20
  },
  {
    id: 1003,
    title: "JavaScript Fundamentals",
    chapter_text: "Explore the core concepts of JavaScript including variables, functions, control flow, and DOM manipulation.",
    video_link: null,
    course_id: 20
  }
];

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
      console.log('Course data:', data);
      return data as Course;
    },
    enabled: !!id,
  });
  
  // Fetch chapters data
  const { 
    data: fetchedChapters = [], 
    isLoading: chaptersLoading, 
    error: chaptersError 
  } = useQuery({
    queryKey: ['chapters', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');
      
      console.log('Fetching chapters for course ID:', id);
      
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('course_id', parseInt(id, 10))
        .order('id', { ascending: true });
      
      if (error) {
        console.error('Error fetching chapters:', error);
        throw error;
      }
      
      console.log('Chapters data:', data);
      
      if (!data || data.length === 0) {
        console.log('No chapters found for this course');
        
        // For course ID 20, return sample chapters when no real chapters exist
        if (id === '20') {
          console.log('Returning sample chapters for demo purposes');
          return sampleChapters as Chapter[];
        }
      }
      
      return data as Chapter[];
    },
    enabled: !!id,
  });
  
  // Use sample chapters only for course ID 20 when no chapters are returned
  const chapters = id === '20' && fetchedChapters.length === 0 
    ? sampleChapters 
    : fetchedChapters;
  
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
