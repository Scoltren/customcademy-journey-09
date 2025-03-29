
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
  const validateDifficultyLevel = (level: string | null): 'Beginner' | 'Intermediate' | 'Advanced' => {
    if (level === 'Beginner' || level === 'Intermediate' || level === 'Advanced') {
      return level;
    }
    return 'Beginner'; // Default fallback
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
            image: course.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
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
