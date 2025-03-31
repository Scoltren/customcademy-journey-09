
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

  // Get courses that exactly match user skill levels
  const exactMatchCourses = recommendedCourses.filter(course => {
    if (course.category_id && userSkillLevels[course.category_id]) {
      return course.difficulty_level === userSkillLevels[course.category_id];
    }
    return false;
  });

  // Determine which courses to display - if we have exact matches, show those only
  const coursesToDisplay = exactMatchCourses.length > 0 ? exactMatchCourses : recommendedCourses;

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6">Recommended Courses</h2>
      
      {loadingCourses ? (
        <LoadingState />
      ) : coursesToDisplay.length > 0 ? (
        <CourseGridDisplay 
          courses={coursesToDisplay} 
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
