
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to add chapter counts to courses
 */
export const addChapterCountsToCourses = async (courses: any[]): Promise<any[]> => {
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
