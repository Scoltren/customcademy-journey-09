
import React from 'react';
import { useRecommendedCourses } from './recommended-courses/useRecommendedCourses';
import LoadingState from './recommended-courses/LoadingState';
import EmptyState from './recommended-courses/EmptyState';
import CourseGridDisplay from './recommended-courses/CourseGridDisplay';

interface RecommendedCoursesSectionProps {
  userId: string;
  userInterests: number[];
}

const RecommendedCoursesSection: React.FC<RecommendedCoursesSectionProps> = ({ 
  userId, 
  userInterests 
}) => {
  const {
    recommendedCourses,
    loadingCourses,
    chapterCounts,
    userSkillLevels
  } = useRecommendedCourses(userId, userInterests);

  // Get all courses that should be displayed
  // Include exact matches AND courses from categories with null difficulty levels
  const coursesToDisplay = recommendedCourses.filter(course => {
    // Include courses that exactly match user skill levels
    if (course.category_id && userSkillLevels[course.category_id]) {
      if (course.difficulty_level === userSkillLevels[course.category_id]) {
        return true;
      }
    }
    
    // Include all courses from categories with null difficulty level
    if (course.category_id && userSkillLevels[course.category_id] === null) {
      return true;
    }
    
    return false;
  });

  // If we don't have any filtered courses, show all recommended courses
  const finalCoursesToDisplay = coursesToDisplay.length > 0 ? coursesToDisplay : recommendedCourses;

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6">Recommended Courses</h2>
      
      {loadingCourses ? (
        <LoadingState />
      ) : finalCoursesToDisplay.length > 0 ? (
        <CourseGridDisplay 
          courses={finalCoursesToDisplay} 
          chapterCounts={chapterCounts}
          userSkillLevels={userSkillLevels}
        />
      ) : (
        <EmptyState hasInterests={userInterests.length > 0} />
      )}
    </div>
  );
};

export default RecommendedCoursesSection;
