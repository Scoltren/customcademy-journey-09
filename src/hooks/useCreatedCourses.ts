
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CourseCreationService } from '@/services/course-creation';
import { Course } from '@/types/course';
import { toast } from 'sonner';

/**
 * Hook to fetch courses created by the current user
 */
export const useCreatedCourses = () => {
  const { user } = useAuth();
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Fetches courses created by the current user
   */
  const fetchCreatedCourses = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const courses = await CourseCreationService.getCreatedCourses(user.id);
      setCreatedCourses(courses);
    } catch (error) {
      toast.error('Failed to load your created courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatedCourses();
  }, [user]);

  return {
    createdCourses,
    isLoading,
    refetchCourses: fetchCreatedCourses
  };
};
