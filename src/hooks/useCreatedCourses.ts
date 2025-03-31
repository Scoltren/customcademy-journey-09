
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CourseCreationService } from '@/services/course-creation';
import { Course } from '@/types/course';
import { toast } from 'sonner';

export const useCreatedCourses = () => {
  const { user } = useAuth();
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCreatedCourses = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const courses = await CourseCreationService.getCreatedCourses(user.id);
      setCreatedCourses(courses);
    } catch (error) {
      console.error('Error fetching created courses:', error);
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
