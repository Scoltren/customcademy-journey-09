
import React from 'react';
import CourseCard from '@/components/CourseCard';
import { Course } from '@/types/course';

interface FilteredCoursesDisplayProps {
  filteredCourses: Course[];
  loading: boolean;
  resetFilters: () => void;
  validateDifficultyLevel: (level: string | null) => 'Beginner' | 'Intermediate' | 'Advanced';
}

const FilteredCoursesDisplay: React.FC<FilteredCoursesDisplayProps> = ({ 
  filteredCourses, 
  loading, 
  resetFilters,
  validateDifficultyLevel
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="glass-card h-96 animate-pulse">
            <div className="h-full rounded-xl bg-slate-800/50"></div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredCourses.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <h3 className="text-xl font-bold mb-2">No courses found</h3>
        <p className="text-slate-400 mb-6">Try adjusting your search criteria or browse all courses.</p>
        <button 
          className="button-primary"
          onClick={resetFilters}
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredCourses.map((course) => (
        <CourseCard 
          key={course.id} 
          course={{
            id: course.id.toString(),
            title: course.title,
            description: course.description || "",
            instructor: 'Instructor',
            image: course.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
            category: course.categories?.name || course.category_name || 'Development',
            level: validateDifficultyLevel(course.difficulty_level),
            duration: course.course_time ? `${course.course_time} hours` : '30 hours',
            students: 0,
            rating: course.overall_rating || 0,
            price: course.price || 0,
            chapterCount: course.chapters_count || 0
          }}
        />
      ))}
    </div>
  );
};

export default FilteredCoursesDisplay;
