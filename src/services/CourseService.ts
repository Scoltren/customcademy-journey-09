
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
  const coursesWithCounts = await addChapterCountsToCourses(courses);
  
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
  const coursesWithCounts = await addChapterCountsToCourses(courses);
  
  return coursesWithCounts;
};

/**
 * Helper function to add chapter counts to courses
 */
const addChapterCountsToCourses = async (courses: any[]): Promise<CourseWithCategory[]> => {
  if (!courses || courses.length === 0) return [];
  
  const courseIds = courses.map(course => course.id);
  
  // Instead of using group(), fetch all chapters for these courses
  const { data: chapters, error: chaptersError } = await supabase
    .from('chapters')
    .select('course_id')
    .in('course_id', courseIds);
  
  if (chaptersError) {
    console.error("Error fetching chapters:", chaptersError);
    return courses; // Return courses without counts if there's an error
  }
  
  // Count chapters per course manually
  const chapterCounts: { [key: string]: number } = {};
  
  chapters?.forEach(chapter => {
    if (chapter.course_id) {
      if (!chapterCounts[chapter.course_id]) {
        chapterCounts[chapter.course_id] = 1;
      } else {
        chapterCounts[chapter.course_id]++;
      }
    }
  });
  
  // Merge chapter counts with courses
  const coursesWithCounts = courses.map(course => ({
    ...course,
    chapters_count: chapterCounts[course.id] || 0
  }));
  
  return coursesWithCounts;
};
