
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/course';

interface CourseWithCategory extends Course {
  categories?: {
    name: string;
  } | null;
  chapters_count?: number;
}

/**
 * Fetches recommended courses for a user based on their interests and skill levels
 */
export const fetchRecommendedCourses = async (userId: string): Promise<CourseWithCategory[]> => {
  try {
    // First, get user interests with skill levels
    const { data: interests, error: interestsError } = await supabase
      .from('user_interest_categories')
      .select('category_id, difficulty_level')
      .eq('user_id', userId);
    
    if (interestsError) {
      throw interestsError;
    }
    
    if (!interests || interests.length === 0) {
      console.log("User has no interests, returning featured courses");
      return fetchFeaturedCourses();
    }
    
    const categoryIds = interests.map(interest => interest.category_id);
    console.log("Found user interests:", categoryIds);
    
    // Create a map of category to difficulty level
    const skillLevels: {[key: number]: string} = {};
    interests.forEach(interest => {
      if (interest.category_id && interest.difficulty_level) {
        skillLevels[interest.category_id] = interest.difficulty_level;
      }
    });
    
    // Get courses that match user interests
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        *,
        categories(name)
      `)
      .in('category_id', categoryIds);
    
    if (coursesError) {
      throw coursesError;
    }
    
    // If no courses found, return featured courses
    if (!courses || courses.length === 0) {
      console.log("No courses match user interests, returning featured courses");
      return fetchFeaturedCourses();
    }
    
    // Sort courses based on matching skill level
    const sortedCourses = [...courses].sort((a, b) => {
      const aCategoryId = a.category_id;
      const bCategoryId = b.category_id;
      
      // If course difficulty matches user's skill level, prioritize it
      const aSkillMatch = a.difficulty_level === skillLevels[aCategoryId];
      const bSkillMatch = b.difficulty_level === skillLevels[bCategoryId];
      
      if (aSkillMatch && !bSkillMatch) return -1;
      if (!aSkillMatch && bSkillMatch) return 1;
      return 0;
    });
    
    // Get chapter counts for each course
    const coursesWithCounts = await addChapterCountsToCourses(sortedCourses);
    console.log(`Returning ${coursesWithCounts.length} recommended courses`);
    
    return coursesWithCounts;
  } catch (error) {
    console.error("Error in fetchRecommendedCourses:", error);
    return fetchFeaturedCourses(); // Fallback to featured courses on error
  }
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
 * Fetches user skill levels for each category
 */
export const fetchUserSkillLevels = async (userId: string): Promise<{[key: number]: string}> => {
  const { data, error } = await supabase
    .from('user_interest_categories')
    .select('category_id, difficulty_level')
    .eq('user_id', userId);
    
  if (error) {
    throw error;
  }
  
  const skillLevels: {[key: number]: string} = {};
  data?.forEach(item => {
    if (item.category_id && item.difficulty_level) {
      skillLevels[item.category_id] = item.difficulty_level;
    }
  });
  
  return skillLevels;
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
