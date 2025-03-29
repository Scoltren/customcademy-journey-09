
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

  useEffect(() => {
    if (userInterests.length > 0) {
      fetchRecommendedCourses();
    }
  }, [userInterests]);

  const fetchRecommendedCourses = async () => {
    try {
      setLoadingCourses(true);
      const categoryIds = userInterests;
      
      if (categoryIds.length === 0) {
        setRecommendedCourses([]);
        return;
      }

      const { data, error } = await supabase
        .from('courses')
        .select('*, categories(name)')
        .in('category_id', categoryIds)
        .limit(8);

      if (error) throw error;
      
      // Format courses to match expected structure
      const formattedCourses = data.map(course => ({
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
