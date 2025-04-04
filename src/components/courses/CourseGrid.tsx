
import React from 'react';
import CourseCard from '@/components/CourseCard';
import { Course } from '@/types/course';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface CourseGridProps {
  courses: any[];
  isUserLoggedIn: boolean;
  hasUserInterests?: boolean;
}

/**
 * Component that displays a grid of course cards
 */
const CourseGrid: React.FC<CourseGridProps> = ({ courses, isUserLoggedIn, hasUserInterests }) => {
  /**
   * Validates and normalizes difficulty level strings
   * @param level The difficulty level to validate
   * @returns Standardized difficulty level or null if invalid
   */
  const validateDifficultyLevel = (level: string | null): 'Beginner' | 'Intermediate' | 'Advanced' | null => {
    if (level === null) return null;
    
    // Ensure first letter is capitalized
    const formattedLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
    
    if (formattedLevel === 'Beginner' || formattedLevel === 'Intermediate' || formattedLevel === 'Advanced') {
      return formattedLevel as 'Beginner' | 'Intermediate' | 'Advanced';
    }
    return null; // Return null if not a valid level
  };

  /**
   * Renders message when user needs to select interests for recommendations
   */
  const renderNoInterestsMessage = () => (
    <div className="bg-slate-800/50 p-8 rounded-xl text-center space-y-4">
      <h3 className="text-xl text-white font-medium">No recommended courses</h3>
      <p className="text-slate-300">Please choose categories you're interested in to see personalized recommendations</p>
      <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700">
        <Link to="/select-interests">Select Interests</Link>
      </Button>
    </div>
  );

  // Show message prompting user to select interests
  if (isUserLoggedIn && hasUserInterests === false) {
    return renderNoInterestsMessage();
  }

  // Show message when no courses are available
  if (courses.length === 0) {
    return (
      <div className="text-center text-slate-400 py-8">
        <p>No courses available at the moment.</p>
      </div>
    );
  }

  // Render grid of courses
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
      {courses.map((course) => {
        // Calculate duration based on course_time if available
        const durationText = course.course_time 
          ? `${course.course_time} hours` 
          : '30 hours'; // Fallback
        
        // Get chapter count if available
        const chapterCount = course.chapters_count || 0;
        
        return (
          <CourseCard
            key={course.id}
            course={{
              id: course.id.toString(),
              title: course.title,
              description: course.description || 'No description available',
              instructor: course.instructor || 'Instructor', 
              image: course.thumbnail || '',
              category: course.categories?.name || course.category_name || 'Development',
              level: validateDifficultyLevel(course.difficulty_level),
              duration: durationText,
              students: 0,
              rating: course.overall_rating || 0,
              price: course.price || 0,
              chapterCount: chapterCount
            }}
            className="h-full"
          />
        );
      })}
    </div>
  );
};

export default CourseGrid;
