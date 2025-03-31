
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/course';

// Define the Category type to match the database structure
export interface Category {
  id: number;
  name: string;
  quiz_id: number | null;
}

// Function to fetch courses with chapter counts from Supabase
export const fetchCourses = async (): Promise<Course[]> => {
  // First fetch the courses with category information
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select(`
      *,
      categories(name)
    `);
  
  if (coursesError) {
    throw coursesError;
  }
  
  if (!coursesData || coursesData.length === 0) {
    return [];
  }
  
  // Get all course IDs to fetch chapter counts
  const courseIds = coursesData.map(course => course.id);
  
  // Fetch chapters for all courses
  const { data: chaptersData, error: chaptersError } = await supabase
    .from('chapters')
    .select('course_id')
    .in('course_id', courseIds);
  
  if (chaptersError) {
    console.error("Error fetching chapter counts:", chaptersError);
    // Return courses without chapter counts if there's an error
    return coursesData;
  }
  
  // Count chapters per course
  const chapterCounts: { [key: number]: number } = {};
  
  if (chaptersData) {
    chaptersData.forEach(chapter => {
      if (chapter.course_id) {
        if (!chapterCounts[chapter.course_id]) {
          chapterCounts[chapter.course_id] = 1;
        } else {
          chapterCounts[chapter.course_id]++;
        }
      }
    });
  }
  
  // Add chapter counts to courses
  const coursesWithChapterCounts = coursesData.map(course => ({
    ...course,
    chapters_count: chapterCounts[course.id] || 0
  }));
  
  return coursesWithChapterCounts;
};

// Function to fetch categories from Supabase
export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*');
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const useCoursesList = () => {
  // Fetch courses using React Query
  const { 
    data: allCourses = [], 
    isLoading: coursesLoading,
    error: coursesError
  } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch categories using React Query
  const { 
    data: categoriesData = [], 
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
  
  return {
    allCourses,
    categoriesData,
    isLoading: coursesLoading || categoriesLoading,
    error: coursesError
  };
};
