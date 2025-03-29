
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import CourseGrid from './courses/CourseGrid';
import LoadingGrid from './courses/LoadingGrid';
import SectionHeader from './courses/SectionHeader';
import { 
  fetchRecommendedCourses, 
  fetchUserInterests, 
  fetchFeaturedCourses 
} from '@/services/CourseService';

const FeaturedCourses = () => {
  const { user } = useAuth();
  const [hasInterests, setHasInterests] = useState<boolean | null>(null);
  
  // Fetch courses based on user status
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['recommendedCourses', user?.id],
    queryFn: () => user ? fetchRecommendedCourses(user.id) : fetchFeaturedCourses(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: true
  });

  // Check if user has any interests
  useEffect(() => {
    const checkUserInterests = async () => {
      if (user) {
        try {
          const interests = await fetchUserInterests(user.id);
          setHasInterests(interests.length > 0);
        } catch (err) {
          console.error('Error checking user interests:', err);
          setHasInterests(false);
        }
      } else {
        setHasInterests(null); // Not logged in
      }
    };
    
    checkUserInterests();
  }, [user]);

  // Display error toast if course fetching fails
  React.useEffect(() => {
    if (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  }, [error]);

  // Determine section title and description based on user status
  const sectionTitle = user ? "Recommended Courses" : "Featured Courses";
  const sectionDescription = user 
    ? "Courses tailored to your interests and learning goals"
    : "Discover our most popular courses designed to help you master new skills";

  return (
    <section className="section-padding">
      <div className="container mx-auto px-6">
        <SectionHeader title={sectionTitle} description={sectionDescription} />
        
        {isLoading ? (
          <LoadingGrid />
        ) : (
          <CourseGrid 
            courses={courses || []} 
            isUserLoggedIn={!!user} 
            hasUserInterests={hasInterests}
          />
        )}
      </div>
    </section>
  );
};

export default FeaturedCourses;
