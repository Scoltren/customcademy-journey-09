import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/course';
import { UserInterest } from '@/types/interest';
import { toast } from 'sonner';

export interface QuizResult {
  id: number;
  quiz_id: number;
  score: number;
  user_id: string;
  quiz?: {
    title: string;
    category_id: number;
    category?: {
      name: string;
    }
  }
  origin?: 'category' | 'course';
  origin_name?: string;
}

export interface EnrolledCourse extends Course {
  progress: number;
  completedChapters: number;
  totalChapters: number;
}

export const useDashboardData = (userId: string | undefined) => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const fetchUserData = useCallback(async () => {
    if (!userId) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Fetch user interests with category names and IDs
      const { data: interests, error: interestsError } = await supabase
        .from('user_interest_categories')
        .select('*, category:categories(id, name)')
        .eq('user_id', userId);
      
      if (interestsError) throw interestsError;
      
      console.log("Fetched user interests:", interests);
      
      // Transform the data to match UserInterest type
      const transformedInterests: UserInterest[] = interests?.map(interest => ({
        user_id: interest.user_id,
        category_id: interest.category_id,
        difficulty_level: interest.difficulty_level,
        category: {
          id: interest.category?.id,
          name: interest.category?.name || 'Unknown'
        }
      })) || [];
      
      setUserInterests(transformedInterests);
      
      // Fetch enrolled courses
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscribed_courses')
        .select('*, course:course_id(id, title, description, thumbnail, difficulty_level, media, course_time, creator_id, overall_rating, price, category_id, created_at)')
        .eq('user_id', userId);
      
      if (subscriptionsError) throw subscriptionsError;
      
      if (subscriptions && subscriptions.length > 0) {
        const coursesWithDetails = await Promise.all(
          subscriptions.map(async (sub) => {
            // Fetch chapters for the course
            const { data: chapters, error: chaptersError } = await supabase
              .from('chapters')
              .select('id, progress_when_finished')
              .eq('course_id', sub.course_id);
            
            if (chaptersError) throw chaptersError;
            
            // Fetch user progress for this course
            const { data: userProgress, error: progressError } = await supabase
              .from('user_chapter_progress')
              .select('chapter_id, finished')
              .eq('course_id', sub.course_id)
              .eq('user_id', userId);
            
            if (progressError) throw progressError;
            
            // Calculate completed chapters
            const completedChapterCount = userProgress?.filter(p => p.finished).length || 0;
            
            // Calculate progress based on completed chapters' progress_when_finished values
            let calculatedProgress = 0;
            if (userProgress && chapters) {
              userProgress.forEach(progress => {
                if (progress.finished) {
                  const chapter = chapters.find(c => c.id === progress.chapter_id);
                  if (chapter && chapter.progress_when_finished) {
                    calculatedProgress += chapter.progress_when_finished;
                  }
                }
              });
            }
            
            // Ensure progress doesn't exceed 100%
            calculatedProgress = Math.min(calculatedProgress, 100);
            
            // Create a properly typed course object
            const courseWithProgress: EnrolledCourse = {
              ...sub.course as unknown as Course,
              progress: calculatedProgress,
              completedChapters: completedChapterCount,
              totalChapters: chapters?.length || 0
            };
            
            return courseWithProgress;
          })
        );
        
        setEnrolledCourses(coursesWithDetails);
      } else {
        setEnrolledCourses([]);
      }
      
      // Fetch quiz results with more detailed information
      const { data: quizzes, error: quizzesError } = await supabase
        .from('user_quiz_results')
        .select('*, quiz:quiz_id(title, category_id, category:category_id(name))')
        .eq('user_id', userId);
      
      if (quizzesError) throw quizzesError;
      
      if (quizzes) {
        setQuizResults(quizzes);
      } else {
        setQuizResults([]);
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load your data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    
    fetchUserData();
  }, [userId, navigate, fetchUserData]);
  
  const handleEditInterests = () => {
    navigate('/select-interests');
  };
  
  return {
    enrolledCourses,
    quizResults,
    userInterests,
    isLoading,
    handleEditInterests,
    fetchUserData
  };
};
