
import React from 'react';
import CourseCard from './CourseCard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from './ui/skeleton';

// Define the course type based on what we're fetching from Supabase
interface Course {
  id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  difficulty_level: string | null;
  price: number | null;
  overall_rating: number | null;
  categories: {
    name: string;
  } | null;
}

const fetchFeaturedCourses = async (): Promise<Course[]> => {
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

const FeaturedCourses = () => {
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['featuredCourses'],
    queryFn: fetchFeaturedCourses,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Show error toast if query fails
  React.useEffect(() => {
    if (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  }, [error]);

  // Helper function to validate difficulty level
  const validateDifficultyLevel = (level: string | null): 'Beginner' | 'Intermediate' | 'Advanced' => {
    if (level === 'Beginner' || level === 'Intermediate' || level === 'Advanced') {
      return level;
    }
    return 'Beginner'; // Default fallback
  };

  return (
    <section className="section-padding">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-4">Featured Courses</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Discover our most popular courses designed to help you master new skills
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="glass-card h-96">
                <Skeleton className="h-full rounded-xl bg-slate-800/50" />
              </div>
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={{
                  id: course.id.toString(),
                  title: course.title,
                  description: course.description || 'No description available',
                  instructor: 'Instructor', 
                  image: course.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
                  category: course.categories?.name || 'Development',
                  level: validateDifficultyLevel(course.difficulty_level),
                  duration: '30 hours',
                  students: 1000,
                  rating: course.overall_rating || 4.5,
                  price: course.price || 0
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-8">
            <p>No courses available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCourses;
