
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/course';

interface CourseWithCategory extends Course {
  categories?: {
    name: string;
  } | null;
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
  
  if (!courses || courses.length === 0) {
    const { data: featuredCourses, error: featuredError } = await supabase
      .from('courses')
      .select(`
        *,
        categories(name)
      `)
      .limit(6);
    
    if (featuredError) {
      throw featuredError;
    }
    
    return featuredCourses || [];
  }
  
  return courses;
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
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      categories(name)
    `)
    .limit(6);
  
  if (error) {
    throw error;
  }
  
  return data || [];
};
