
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Course } from '@/types/course';
import CourseCard from '@/components/CourseCard';

interface RecommendedCoursesSectionProps {
  userId: string;
  userInterests: number[];
}

const RecommendedCoursesSection: React.FC<RecommendedCoursesSectionProps> = ({ 
  userId, 
  userInterests 
}) => {
  const navigate = useNavigate();
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
            
            const aSkillMatch = a.difficulty_level === userSkillLevels[aCategoryId];
            const bSkillMatch = b.difficulty_level === userSkillLevels[bCategoryId];
            
            if (aSkillMatch && !bSkillMatch) return -1;
            if (!aSkillMatch && bSkillMatch) return 1;
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

  const validateDifficultyLevel = (level: string | null): 'Beginner' | 'Intermediate' | 'Advanced' => {
    if (level === 'Beginner' || level === 'Intermediate' || level === 'Advanced') {
      return level;
    }
    return 'Beginner'; // Default fallback
  };

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6">Recommended Courses</h2>
      
      {loadingCourses ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : recommendedCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={{
                id: course.id.toString(),
                title: course.title,
                description: course.description || 'No description available',
                instructor: 'Instructor', 
                image: course.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
                category: course.category_name || 'Development',
                level: validateDifficultyLevel(course.difficulty_level),
                duration: `${course.course_time || 0} hours`,
                students: 0, // Not displaying as requested
                rating: course.overall_rating || 0,
                price: course.price || 0,
                chapterCount: chapterCounts[course.id] || 0
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {userInterests.length > 0 
              ? "No courses match your interests yet" 
              : "Select interests to get course recommendations"}
          </p>
          <Button 
            onClick={() => userInterests.length > 0 
              ? navigate('/courses') 
              : navigate('/select-interests')}
          >
            {userInterests.length > 0 ? "Browse All Courses" : "Select Interests"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecommendedCoursesSection;
