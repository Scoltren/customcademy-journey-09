
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Hero from '@/components/Hero';
import FeaturedCourses from '@/components/FeaturedCourses';
import CategorySection from '@/components/CategorySection';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserInterest {
  id: number;
  category_id: number;
  user_id: string;
  created_at: string;
  category: {
    id: number;
    name: string;
  }
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  overall_rating: number;
  difficulty_level: string;
  category_id: number;
  category_name: string;
  creator_id: string;
  created_at: string;
}

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserInterests();
    }
  }, [user]);

  useEffect(() => {
    if (userInterests.length > 0) {
      fetchRecommendedCourses();
    }
  }, [userInterests]);

  const fetchUserInterests = async () => {
    try {
      setLoadingInterests(true);
      const { data, error } = await supabase
        .from('user_categories')
        .select('*, category:categories(*)')
        .eq('user_id', user?.id);

      if (error) throw error;
      setUserInterests(data || []);
    } catch (error: any) {
      console.error('Error fetching user interests:', error.message);
      toast.error('Failed to load your interests');
    } finally {
      setLoadingInterests(false);
    }
  };

  const fetchRecommendedCourses = async () => {
    try {
      setLoadingCourses(true);
      const categoryIds = userInterests.map(interest => interest.category_id);
      
      if (categoryIds.length === 0) {
        setRecommendedCourses([]);
        return;
      }

      const { data, error } = await supabase
        .from('courses')
        .select('*, categories!inner(*)')
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
        created_at: course.created_at
      }));
      
      setRecommendedCourses(formattedCourses);
    } catch (error: any) {
      console.error('Error fetching recommended courses:', error.message);
      toast.error('Failed to load recommended courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!user ? (
        // Content for non-logged in users
        <>
          <Hero />
          <FeaturedCourses />
          <CategorySection />
        </>
      ) : (
        // Content for logged in users
        <div className="container mx-auto px-4 py-8">
          {/* User Interests Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Your Interests</h2>
              <Button 
                onClick={() => navigate('/select-interests')}
                variant="outline"
              >
                Edit your interests
              </Button>
            </div>
            
            {loadingInterests ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : userInterests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {userInterests.map((interest) => (
                  <Badge key={interest.id} className="text-sm py-1 px-3">
                    {interest.category?.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">You haven't selected any interests yet</p>
                <Button onClick={() => navigate('/select-interests')}>
                  Select Interests
                </Button>
              </div>
            )}
          </div>

          {/* Recommended Courses Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Recommended Courses</h2>
            
            {loadingCourses ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : recommendedCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendedCourses.map((course) => (
                  <Link key={course.id} to={`/courses/${course.id}`} className="block">
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <div className="aspect-video relative bg-gray-200 dark:bg-gray-700">
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center mb-2">
                          <Badge variant="outline" className="text-xs">
                            {course.category_name}
                          </Badge>
                          {course.overall_rating > 0 && (
                            <div className="ml-auto flex items-center text-amber-500">
                              <span className="text-sm font-medium">{course.overall_rating.toFixed(1)}</span>
                              <span className="ml-1">★</span>
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{course.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-2">
                          {course.description}
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="font-bold">
                            {course.price ? `$${course.price.toFixed(2)}` : 'Free'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {course.difficulty_level || 'All Levels'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
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
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Index;
