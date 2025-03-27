
import React, { useState, useEffect } from 'react';
import CourseCard from './CourseCard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const FeaturedCourses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Fetch courses directly from Supabase
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
        
        if (data) {
          setCourses(data);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <section className="section-padding">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-4">Featured Courses</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Discover our most popular courses designed to help you master new skills
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="glass-card h-96 animate-pulse">
                <div className="h-full rounded-xl bg-slate-800/50"></div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
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
                  level: course.difficulty_level || 'Beginner',
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
