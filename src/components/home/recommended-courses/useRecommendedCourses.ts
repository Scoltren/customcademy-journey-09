
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Course } from '@/types/course';

export const useRecommendedCourses = (userId: string, userInterests: number[]) => {
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [chapterCounts, setChapterCounts] = useState<{[key: string]: number}>({});
  const [userSkillLevels, setUserSkillLevels] = useState<{[key: number]: string | null}>({});

  // Fetch user skill levels for each category
  useEffect(() => {
    const fetchUserSkillLevels = async () => {
      if (!userId || userInterests.length === 0) return;
      
      try {
        const { data, error } = await supabase
          .from('user_interest_categories')
          .select('category_id, difficulty_level')
          .eq('user_id', userId);
          
        if (error) throw error;
        
        const skillLevels: {[key: number]: string | null} = {};
        data?.forEach(item => {
          if (item.category_id) {
            skillLevels[item.category_id] = item.difficulty_level || null;
          }
        });
        
        console.log("User skill levels:", skillLevels);
        setUserSkillLevels(skillLevels);
      } catch (error) {
        console.error('Error fetching user skill levels:', error);
      }
    };
    
    fetchUserSkillLevels();
  }, [userId, userInterests]);

  // Fetch recommended courses when interests or skill levels change
  useEffect(() => {
    if (userInterests.length > 0) {
      fetchRecommendedCourses();
    }
  }, [userInterests, userSkillLevels]);

  const fetchRecommendedCourses = async () => {
    try {
      setLoadingCourses(true);
      const categoryIds = userInterests;
      
      if (categoryIds.length === 0) {
        setRecommendedCourses([]);
        return;
      }

      // Fetch courses based on user interests
      const { data, error } = await supabase
        .from('courses')
        .select('*, categories(name)')
        .in('category_id', categoryIds);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setRecommendedCourses([]);
        setLoadingCourses(false);
        return;
      }
      
      // Filter and prioritize courses that match both category and difficulty level
      const exactMatchCourses: Course[] = [];
      const nullLevelCategoryCourses: Course[] = [];
      const otherCourses: Course[] = [];
      
      data.forEach(course => {
        const categoryId = course.category_id;
        if (categoryId && categoryId in userSkillLevels) {
          const userLevel = userSkillLevels[categoryId];
          
          // For NULL difficulty levels, include all courses for that category
          if (userLevel === null) {
            nullLevelCategoryCourses.push(course);
          }
          // Check for exact difficulty level match
          else if (course.difficulty_level && course.difficulty_level === userLevel) {
            exactMatchCourses.push(course);
          } else {
            otherCourses.push(course);
          }
        } else {
          otherCourses.push(course);
        }
      });
      
      // Combine the arrays - exact matches first, then null level categories, then others
      const sortedCourses = [...exactMatchCourses, ...nullLevelCategoryCourses, ...otherCourses];
      
      // Format courses to match expected structure
      const formattedCourses = sortedCourses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        price: course.price,
        overall_rating: course.overall_rating,
        difficulty_level: course.difficulty_level,
        category_id: course.category_id,
        category_name: course.categories?.name || 'Uncategorized',
        categories: course.categories,
        creator_id: course.creator_id,
        created_at: course.created_at,
        media: course.media,
        course_time: course.course_time
      }));
      
      setRecommendedCourses(formattedCourses);
      
      // Fetch chapter counts
      if (formattedCourses.length > 0) {
        fetchChapterCounts(formattedCourses.map(course => course.id));
      }
      
    } catch (error: any) {
      console.error('Error fetching recommended courses:', error.message);
      toast.error('Failed to load recommended courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchChapterCounts = async (courseIds: number[]) => {
    try {
      // Fetch all chapters for these courses
      const { data, error } = await supabase
        .from('chapters')
        .select('course_id')
        .in('course_id', courseIds);
      
      if (error) throw error;
      
      // Count chapters per course manually
      const counts: {[key: string]: number} = {};
      
      if (data) {
        data.forEach(chapter => {
          if (chapter.course_id) {
            if (!counts[chapter.course_id]) {
              counts[chapter.course_id] = 1;
            } else {
              counts[chapter.course_id]++;
            }
          }
        });
      }
      
      setChapterCounts(counts);
    } catch (error) {
      console.error('Error fetching chapter counts:', error);
    }
  };

  return {
    recommendedCourses,
    loadingCourses,
    chapterCounts,
    userSkillLevels
  };
};
