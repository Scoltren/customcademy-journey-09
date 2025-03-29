
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Course } from '@/types/course';

export const useRecommendedCourses = (userId: string, userInterests: number[]) => {
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [chapterCounts, setChapterCounts] = useState<{[key: string]: number}>({});
  const [userSkillLevels, setUserSkillLevels] = useState<{[key: number]: string}>({});

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
        
        const skillLevels: {[key: number]: string} = {};
        data?.forEach(item => {
          if (item.category_id && item.difficulty_level) {
            skillLevels[item.category_id] = item.difficulty_level;
          }
        });
        
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

      // Fetch courses based on user interests and skill levels
      let query = supabase
        .from('courses')
        .select('*, categories(name)')
        .in('category_id', categoryIds);
        
      // Apply skill level filter if we have skill levels
      if (Object.keys(userSkillLevels).length > 0) {
        // This query will prioritize courses that match the user's skill level
        // but still include other courses as fallback
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Sort courses to prioritize those matching user's skill level for each category
          data.sort((a, b) => {
            const aCategoryId = a.category_id;
            const bCategoryId = b.category_id;
            
            // Exact match: Same category AND same difficulty level
            const aExactMatch = a.difficulty_level === userSkillLevels[aCategoryId];
            const bExactMatch = b.difficulty_level === userSkillLevels[bCategoryId];
            
            if (aExactMatch && !bExactMatch) return -1;
            if (!aExactMatch && bExactMatch) return 1;
            
            // Partial match: Same category only
            if (aCategoryId && !bCategoryId) return -1;
            if (!aCategoryId && bCategoryId) return 1;
            
            return 0;
          });
        }
        
        // Format courses to match expected structure
        const formattedCourses = data?.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          price: course.price,
          overall_rating: course.overall_rating,
          difficulty_level: course.difficulty_level,
          category_id: course.category_id,
          category_name: course.categories?.name || 'Uncategorized',
          creator_id: course.creator_id,
          created_at: course.created_at,
          media: course.media,
          course_time: course.course_time
        }));
        
        setRecommendedCourses(formattedCourses as Course[]);
        
        // Fetch chapter counts
        if (formattedCourses && formattedCourses.length > 0) {
          fetchChapterCounts(formattedCourses.map(course => course.id));
        }
      } else {
        // If no skill levels, just fetch based on categories
        const { data, error } = await query.limit(8);
        
        if (error) throw error;
        
        // Format courses to match expected structure
        const formattedCourses = data?.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          price: course.price,
          overall_rating: course.overall_rating,
          difficulty_level: course.difficulty_level,
          category_id: course.category_id,
          category_name: course.categories?.name || 'Uncategorized',
          creator_id: course.creator_id,
          created_at: course.created_at,
          media: course.media,
          course_time: course.course_time
        }));
        
        setRecommendedCourses(formattedCourses as Course[]);
        
        // Fetch chapter counts
        if (formattedCourses && formattedCourses.length > 0) {
          fetchChapterCounts(formattedCourses.map(course => course.id));
        }
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
