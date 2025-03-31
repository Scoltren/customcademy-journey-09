
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCoursesList } from '@/hooks/courses/useCoursesList';
import { useFilteredCourses } from '@/hooks/courses/useFilteredCourses';
import CourseFilters from '@/components/courses/CourseFilters';
import FilteredCoursesDisplay from '@/components/courses/FilteredCoursesDisplay';

const Courses = () => {
  const isMobile = useIsMobile();
  
  // Get courses and categories data
  const { 
    allCourses, 
    categoriesData, 
    isLoading, 
    error 
  } = useCoursesList();
  
  // Derived categories array for the dropdown
  const categories = React.useMemo(() => {
    return ['All Categories', ...categoriesData.map(cat => cat.name)];
  }, [categoriesData]);
  
  // Use filtered courses hook
  const { 
    filteredCourses, 
    filterState, 
    resetFilters,
    validateDifficultyLevel
  } = useFilteredCourses(allCourses);
  
  // Show error toast if course query fails
  React.useEffect(() => {
    if (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses data');
    }
  }, [error]);
  
  return (
    <div className="min-h-screen bg-midnight">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-6">
          <div className="mb-12">
            <h1 className="heading-lg mb-4">Explore Our Courses</h1>
            <p className="text-slate-400 max-w-3xl">
              Browse our comprehensive collection of courses across various categories. 
              Filter by topic, difficulty level, or search for specific courses to find 
              the perfect match for your learning journey.
            </p>
          </div>
          
          <CourseFilters 
            categories={categories}
            selectedCategory={filterState.selectedCategory}
            setSelectedCategory={filterState.setSelectedCategory}
            selectedLevel={filterState.selectedLevel}
            setSelectedLevel={filterState.setSelectedLevel}
            selectedPrice={filterState.selectedPrice}
            setSelectedPrice={filterState.setSelectedPrice}
            selectedRating={filterState.selectedRating}
            setSelectedRating={filterState.setSelectedRating}
            searchTerm={filterState.searchTerm}
            setSearchTerm={filterState.setSearchTerm}
            showFilters={filterState.showFilters}
            setShowFilters={filterState.setShowFilters}
            isMobile={isMobile}
          />
          
          <div className="text-slate-400 mb-8">
            Showing <span className="text-white font-medium">{filteredCourses.length}</span> courses
          </div>
          
          <FilteredCoursesDisplay 
            filteredCourses={filteredCourses}
            loading={isLoading}
            resetFilters={resetFilters}
            validateDifficultyLevel={validateDifficultyLevel}
          />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courses;
