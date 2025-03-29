
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

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6">Recommended Courses</h2>
      
      {loadingCourses ? (
        <LoadingState />
      ) : recommendedCourses.length > 0 ? (
        <CourseGridDisplay 
          courses={recommendedCourses} 
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
