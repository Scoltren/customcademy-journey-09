
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
      
      // Fetch enrolled courses with progress
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscribed_courses')
        .select('*, course:course_id(id, title, description, thumbnail, difficulty_level, media, course_time, creator_id, overall_rating, price, category_id, created_at)')
        .eq('user_id', userId);
      
      if (subscriptionsError) throw subscriptionsError;
      
      if (subscriptions && subscriptions.length > 0) {
        const coursesWithDetails = await Promise.all(
          subscriptions.map(async (sub) => {
            const { data: chapters, error: chaptersError } = await supabase
              .from('chapters')
              .select('*')
              .eq('course_id', sub.course_id);
            
            if (chaptersError) throw chaptersError;
            
            // Create a properly typed course object by explicitly casting
            const courseWithProgress: EnrolledCourse = {
              ...sub.course as unknown as Course,
              progress: sub.progress || 0,
              completedChapters: Math.floor((chapters?.length || 0) * ((sub.progress || 0) / 100)),
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
      
      // Process quiz results to determine their origin (category or course)
      if (quizzes && quizzes.length > 0) {
        const processedResults = await Promise.all(quizzes.map(async (quiz) => {
          // Check if the quiz is part of a course chapter
          const { data: courseChapter } = await supabase
            .from('chapters')
            .select('*, course:course_id(title)')
            .eq('quiz_id', quiz.quiz_id)
            .maybeSingle();
          
          if (courseChapter) {
            return {
              ...quiz,
              origin: 'course' as const,
              origin_name: courseChapter.course?.title ? `Course: ${courseChapter.course.title}` : 'Course'
            };
          } else {
            // The quiz is part of a category (not a course)
            return {
              ...quiz,
              origin: 'category' as const,
              origin_name: quiz.quiz?.category?.name ? `Category: ${quiz.quiz.category.name}` : 'Category'
            };
          }
        }));
        
        setQuizResults(processedResults);
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
