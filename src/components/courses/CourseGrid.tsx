
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

const CourseGrid: React.FC<CourseGridProps> = ({ courses, isUserLoggedIn, hasUserInterests }) => {
  const validateDifficultyLevel = (level: string | null): 'Beginner' | 'Intermediate' | 'Advanced' => {
    if (level === 'Beginner' || level === 'Intermediate' || level === 'Advanced') {
      return level;
    }
    return 'Beginner'; // Default fallback
  };

  const renderNoInterestsMessage = () => (
    <div className="bg-slate-800/50 p-8 rounded-xl text-center space-y-4">
      <h3 className="text-xl text-white font-medium">No recommended courses</h3>
      <p className="text-slate-300">Please choose categories you're interested in to see personalized recommendations</p>
      <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700">
        <Link to="/select-interests">Select Interests</Link>
      </Button>
    </div>
  );

  if (isUserLoggedIn && hasUserInterests === false) {
    return renderNoInterestsMessage();
  }

  if (courses.length === 0) {
    return (
      <div className="text-center text-slate-400 py-8">
        <p>No courses available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={{
            id: course.id.toString(),
            title: course.title,
            description: course.description || 'No description available',
            instructor: 'Instructor', 
            image: course.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
            category: course.categories?.name || 'Development',
            level: validateDifficultyLevel(course.difficulty_level),
            duration: '30 hours',
            students: 1000,
            rating: course.overall_rating || 4.5,
            price: course.price || 0
          }}
          className="h-full"
        />
      ))}
    </div>
  );
};

export default CourseGrid;
