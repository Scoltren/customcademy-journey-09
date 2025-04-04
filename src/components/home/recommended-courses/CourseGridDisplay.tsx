
import React from 'react';
import CourseCard from '@/components/CourseCard';
import { Course } from '@/types/course';

interface CourseGridDisplayProps {
  courses: Course[];
  chapterCounts: {[key: string]: number};
  userSkillLevels: {[key: number]: string};
}

/**
 * Component that displays a grid of course cards for recommended courses
 */
const CourseGridDisplay: React.FC<CourseGridDisplayProps> = ({ 
  courses, 
  chapterCounts,
  userSkillLevels
}) => {
  /**
   * Validates and normalizes difficulty level strings
   * @param level The difficulty level string to validate
   * @returns Normalized difficulty level or null if invalid
   */
  const validateDifficultyLevel = (level: string | null): 'Beginner' | 'Intermediate' | 'Advanced' | null => {
    if (level === null) return null;
    
    // Check if level is already in valid format
    if (level === 'Beginner' || level === 'Intermediate' || level === 'Advanced') {
      return level;
    }
    
    // Capitalize the first letter if it's lowercase
    const formattedLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
    
    // Return formatted level if valid, otherwise null
    if (formattedLevel === 'Beginner' || formattedLevel === 'Intermediate' || formattedLevel === 'Advanced') {
      return formattedLevel as 'Beginner' | 'Intermediate' | 'Advanced';
    }
    
    return null; // Return null for invalid levels
  };

  /**
   * Get the category name string regardless of whether it's a string or an object
   * @param category The category_name value from the course
   * @returns The category name as a string
   */
  const getCategoryName = (category: string | { name: string } | undefined): string => {
    if (!category) return 'Development';
    if (typeof category === 'string') return category;
    return category.name || 'Development';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Map through courses and render course cards */}
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={{
            id: course.id.toString(),
            title: course.title,
            description: course.description || 'No description available',
            instructor: 'Instructor', 
            image: course.thumbnail || '',
            category: getCategoryName(course.category_name),
            level: validateDifficultyLevel(course.difficulty_level),
            duration: `${course.course_time || 0} hours`,
            students: 0,
            rating: course.overall_rating || 0,
            price: course.price || 0,
            chapterCount: chapterCounts[course.id] || 0
          }}
        />
      ))}
    </div>
  );
};

export default CourseGridDisplay;
