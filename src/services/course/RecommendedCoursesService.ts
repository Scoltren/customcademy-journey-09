
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
    
    // Sort courses based on matching skill level - prioritize exact matches
    const sortedCourses = [...courses].sort((a, b) => {
      const aCategoryId = a.category_id;
      const bCategoryId = b.category_id;
      
      // If both courses match category, prioritize difficulty level match
      if (aCategoryId && bCategoryId) {
        const aSkillLevel = skillLevels[aCategoryId];
        const bSkillLevel = skillLevels[bCategoryId];
        
        const aIsExactMatch = a.difficulty_level === aSkillLevel;
        const bIsExactMatch = b.difficulty_level === bSkillLevel;
        
        if (aIsExactMatch && !bIsExactMatch) return -1;
        if (!aIsExactMatch && bIsExactMatch) return 1;
      }
      
      // If only one matches category, prioritize that one
      if (aCategoryId && !bCategoryId) return -1;
      if (!aCategoryId && bCategoryId) return 1;
      
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

// Import from ChapterService
import { addChapterCountsToCourses } from './ChapterService';
