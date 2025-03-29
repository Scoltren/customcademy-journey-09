
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/course';

interface CourseWithCategory extends Course {
  categories?: {
    name: string;
  } | null;
  chapters_count?: number;
}

/**
 * Fetches recommended courses for a user based on their interests
 */
export const fetchRecommendedCourses = async (userId: string): Promise<CourseWithCategory[]> => {
  const { data: interests, error: interestsError } = await supabase
    .from('user_interest_categories')
    .select('category_id')
    .eq('user_id', userId);
  
  if (interestsError) {
    throw interestsError;
  }
  
  if (!interests || interests.length === 0) {
    return [];
  }
  
  const categoryIds = interests.map(interest => interest.category_id);
  
  // First, get courses that match user interests
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select(`
      *,
      categories(name)
    `)
    .in('category_id', categoryIds)
    .limit(6);
  
  if (coursesError) {
    throw coursesError;
  }
  
  // Fall back to featured courses if no matches
  if (!courses || courses.length === 0) {
    return fetchFeaturedCourses();
  }
  
  // Get chapter counts for each course
  const courseIds = courses.map(course => course.id);
  const { data: chapterCounts, error: chaptersError } = await supabase
    .from('chapters')
    .select('course_id, count')
    .in('course_id', courseIds)
    .group('course_id');
  
  if (chaptersError) {
    console.error("Error fetching chapter counts:", chaptersError);
  }
  
  // Merge chapter counts with courses
  const coursesWithCounts = courses.map(course => {
    const chapterData = chapterCounts?.find(c => c.course_id === course.id);
    return {
      ...course,
      chapters_count: chapterData ? parseInt(chapterData.count) : 0
    };
  });
  
  return coursesWithCounts;
};

/**
 * Fetches user interests as category IDs
 */
export const fetchUserInterests = async (userId: string): Promise<number[]> => {
  const { data, error } = await supabase
    .from('user_interest_categories')
    .select('category_id')
    .eq('user_id', userId);
  
  if (error) {
    throw error;
  }
  
  return data?.map(item => Number(item.category_id)) || [];
};

/**
 * Fetches a curated list of featured courses
 */
export const fetchFeaturedCourses = async (): Promise<CourseWithCategory[]> => {
  // Get courses
  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      *,
      categories(name)
    `)
    .limit(6);
  
  if (error) {
    throw error;
  }
  
  if (!courses || courses.length === 0) {
    return [];
  }
  
  // Get chapter counts for each course
  const courseIds = courses.map(course => course.id);
  const { data: chapterCounts, error: chaptersError } = await supabase
    .from('chapters')
    .select('course_id, count(*)')
    .in('course_id', courseIds)
    .group('course_id');
  
  if (chaptersError) {
    console.error("Error fetching chapter counts:", chaptersError);
  }
  
  // Merge chapter counts with courses
  const coursesWithCounts = courses.map(course => {
    const chapterData = chapterCounts?.find(c => c.course_id === course.id);
    return {
      ...course,
      chapters_count: chapterData ? parseInt(chapterData.count) : 0
    };
  });
  
  return coursesWithCounts;
};
