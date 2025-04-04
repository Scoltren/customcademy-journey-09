
// This file would need to be created with comments if it doesn't exist
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/course';

/**
 * Custom hook to fetch and manage recommended courses for a user
 * @param userId The ID of the current user
 * @param userInterests Array of user interest category IDs
 */
export const useRecommendedCourses = (userId: string, userInterests: number[]) => {
  // State for storing recommended courses and related data
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [chapterCounts, setChapterCounts] = useState<{[key: string]: number}>({});
  const [userSkillLevels, setUserSkillLevels] = useState<{[key: number]: string}>({});
  
  // Fetch courses and user data when component mounts or dependencies change
  useEffect(() => {
    // Skip fetch if no user ID or interests are empty
    if (!userId || userInterests.length === 0) {
      setLoadingCourses(false);
      return;
    }
    
    // Fetch recommended courses based on user interests
    fetchRecommendedCourses();
    // Fetch user skill levels for different categories
    fetchUserSkillLevels();
  }, [userId, userInterests]);
  
  // Function to fetch recommended courses from database
  const fetchRecommendedCourses = async () => {
    try {
      setLoadingCourses(true);
      
      // Build filter for categories that match user interests
      const categoryFilter = userInterests.length > 0 
        ? `category_id.in.(${userInterests.join(',')})` 
        : '';
      
      // Query courses from database
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select(`
          *,
          category_name:categories(name)
        `)
        .or(`${categoryFilter}`);
      
      if (error) throw error;
      
      // Transform the data to match Course type
      const courses: Course[] = coursesData?.map(course => ({
        ...course,
        category_name: course.category_name ? (typeof course.category_name === 'string' ? 
          course.category_name : course.category_name.name) : undefined
      })) || [];
      
      // Set fetched courses to state
      setRecommendedCourses(courses);
      
      // Fetch chapter counts for each course
      await fetchChapterCounts(courses);
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };
  
  // Function to fetch chapter counts for courses
  const fetchChapterCounts = async (courses: Course[]) => {
    if (courses.length === 0) return;
    
    try {
      const courseIds = courses.map(c => c.id);
      
      // Count chapters for each course
      const { data, error } = await supabase
        .from('chapters')
        .select('course_id')
        .in('course_id', courseIds);
      
      if (error) throw error;
      
      // Count occurrences of each course_id
      const counts: {[key: string]: number} = {};
      data?.forEach(item => {
        const courseId = item.course_id.toString();
        counts[courseId] = (counts[courseId] || 0) + 1;
      });
      
      setChapterCounts(counts);
    } catch (error) {
      console.error('Error fetching chapter counts:', error);
    }
  };
  
  // Function to fetch user skill levels for different categories
  const fetchUserSkillLevels = async () => {
    if (userInterests.length === 0) return;
    
    try {
      // Query user's skill level for each interest category
      const { data, error } = await supabase
        .from('user_interest_categories')
        .select('category_id, difficulty_level')
        .eq('user_id', userId)
        .in('category_id', userInterests);
      
      if (error) throw error;
      
      // Convert to object with category ID as key
      const skillLevels: {[key: number]: string} = {};
      data?.forEach(item => {
        skillLevels[item.category_id] = item.difficulty_level || null;
      });
      
      setUserSkillLevels(skillLevels);
    } catch (error) {
      console.error('Error fetching user skill levels:', error);
    }
  };
  
  return {
    recommendedCourses,
    loadingCourses,
    chapterCounts,
    userSkillLevels
  };
};
