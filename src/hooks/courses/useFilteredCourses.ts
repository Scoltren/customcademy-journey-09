
import { useState, useMemo } from 'react';
import { Course } from '@/types/course';

export const useFilteredCourses = (allCourses: Course[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedPrice, setSelectedPrice] = useState('All Prices');
  const [selectedRating, setSelectedRating] = useState('All Ratings');
  const [showFilters, setShowFilters] = useState(false);

  // Helper function to validate difficulty level
  const validateDifficultyLevel = (level: string | null): 'Beginner' | 'Intermediate' | 'Advanced' => {
    if (level === 'Beginner' || level === 'Intermediate' || level === 'Advanced') {
      return level;
    }
    return 'Beginner'; // Default fallback
  };

  // Filter courses based on selected filters
  const filteredCourses = useMemo(() => {
    return allCourses.filter(course => {
      if (searchTerm && 
          !course.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !course.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      if (selectedCategory !== 'All Categories' && course.categories?.name !== selectedCategory) {
        return false;
      }
      
      if (selectedLevel !== 'All Levels' && course.difficulty_level !== selectedLevel) {
        return false;
      }
      
      if (selectedPrice !== 'All Prices') {
        const price = course.price || 0;
        if (selectedPrice === 'Free' && price > 0) return false;
        if (selectedPrice === 'Under $50' && (price >= 50)) return false;
        if (selectedPrice === '$50-$100' && (price < 50 || price > 100)) return false;
        if (selectedPrice === 'Over $100' && price <= 100) return false;
      }
      
      if (selectedRating !== 'All Ratings') {
        const minRating = parseFloat(selectedRating.split(' ')[0]);
        if ((course.overall_rating || 0) < minRating) return false;
      }
      
      return true;
    });
  }, [allCourses, searchTerm, selectedCategory, selectedLevel, selectedPrice, selectedRating]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedLevel('All Levels');
    setSelectedPrice('All Prices');
    setSelectedRating('All Ratings');
  };

  return {
    filteredCourses,
    filterState: {
      searchTerm,
      setSearchTerm,
      selectedCategory,
      setSelectedCategory,
      selectedLevel,
      setSelectedLevel,
      selectedPrice,
      setSelectedPrice,
      selectedRating,
      setSelectedRating,
      showFilters,
      setShowFilters
    },
    resetFilters,
    validateDifficultyLevel
  };
};
