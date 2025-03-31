
import React from 'react';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import FilterDropdown from './FilterDropdown';
import SearchInput from './SearchInput';

interface CourseFiltersProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  selectedPrice: string;
  setSelectedPrice: (price: string) => void;
  selectedRating: string;
  setSelectedRating: (rating: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  isMobile: boolean;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({ 
  categories, 
  selectedCategory, 
  setSelectedCategory,
  selectedLevel,
  setSelectedLevel,
  selectedPrice,
  setSelectedPrice,
  selectedRating,
  setSelectedRating,
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  isMobile
}) => {
  const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
  const prices = ['All Prices', 'Free', 'Under $50', '$50-$100', 'Over $100'];
  const ratings = ['All Ratings', '4.5 & Up', '4.0 & Up', '3.5 & Up', '3.0 & Up'];

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center mb-6">
        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        <button 
          className="lg:hidden button-secondary flex items-center gap-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filters
        </button>
        
        <div className="hidden lg:flex items-center gap-4 flex-wrap">
          <FilterDropdown 
            options={categories} 
            selected={selectedCategory} 
            setSelected={setSelectedCategory} 
            label="Category" 
          />
          
          <FilterDropdown 
            options={levels} 
            selected={selectedLevel} 
            setSelected={setSelectedLevel} 
            label="Level" 
          />
          
          <FilterDropdown 
            options={prices} 
            selected={selectedPrice} 
            setSelected={setSelectedPrice} 
            label="Price" 
          />
          
          <FilterDropdown 
            options={ratings} 
            selected={selectedRating} 
            setSelected={(option) => setSelectedRating(option)} 
            label="Rating" 
          />
        </div>
      </div>
      
      <div className={cn(
        "lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 transition-all duration-300",
        showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      )}>
        <FilterDropdown 
          options={categories} 
          selected={selectedCategory} 
          setSelected={setSelectedCategory} 
          label="Category" 
        />
        
        <FilterDropdown 
          options={levels} 
          selected={selectedLevel} 
          setSelected={setSelectedLevel} 
          label="Level" 
        />
        
        <FilterDropdown 
          options={prices} 
          selected={selectedPrice} 
          setSelected={setSelectedPrice} 
          label="Price" 
        />
        
        <FilterDropdown 
          options={ratings} 
          selected={selectedRating} 
          setSelected={(option) => setSelectedRating(option)} 
          label="Rating" 
        />
      </div>
    </div>
  );
};

export default CourseFilters;
