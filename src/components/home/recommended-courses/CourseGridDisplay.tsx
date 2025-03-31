
import React from 'react';
import CourseCard from '@/components/CourseCard';
import { Course } from '@/types/course';

interface CourseGridDisplayProps {
  courses: Course[];
  chapterCounts: {[key: string]: number};
  userSkillLevels: {[key: number]: string};
}

const CourseGridDisplay: React.FC<CourseGridDisplayProps> = ({ 
  courses, 
  chapterCounts,
  userSkillLevels
}) => {
  const validateDifficultyLevel = (level: string | null): 'Beginner' | 'Intermediate' | 'Advanced' | null => {
    if (level === null) return null;
    
    if (level === 'Beginner' || level === 'Intermediate' || level === 'Advanced') {
      return level;
    }
    
    // Capitalize the first letter if it's lowercase
    const formattedLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
    
    if (formattedLevel === 'Beginner' || formattedLevel === 'Intermediate' || formattedLevel === 'Advanced') {
      return formattedLevel as 'Beginner' | 'Intermediate' | 'Advanced';
    }
    
    return null; // Return null for invalid levels
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={{
            id: course.id.toString(),
            title: course.title,
            description: course.description || 'No description available',
            instructor: 'Instructor', 
            image: course.thumbnail || '',
            category: course.category_name || 'Development',
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
