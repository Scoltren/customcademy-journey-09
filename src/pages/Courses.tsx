
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { Search, Filter, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

// Define the course type based on what we're fetching from Supabase
interface Course {
  id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  difficulty_level: string | null;
  price: number | null;
  overall_rating: number | null;
  category_id: number | null;
  categories: {
    name: string;
  } | null;
}

// Define the category type
interface Category {
  id: number;
  name: string;
}

// Function to fetch courses from Supabase
const fetchCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      categories(name)
    `);
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

// Function to fetch categories from Supabase
const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*');
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedPrice, setSelectedPrice] = useState('All Prices');
  const [selectedRating, setSelectedRating] = useState('All Ratings');
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch courses using React Query
  const { 
    data: allCourses = [], 
    isLoading: coursesLoading,
    error: coursesError
  } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch categories using React Query
  const { 
    data: categoriesData = [], 
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
  
  // Derived categories array for the dropdown
  const categories = React.useMemo(() => {
    return ['All Categories', ...categoriesData.map(cat => cat.name)];
  }, [categoriesData]);
  
  // Show error toast if course query fails
  React.useEffect(() => {
    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      toast.error('Failed to load courses data');
    }
  }, [coursesError]);
  
  const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
  const prices = ['All Prices', 'Free', 'Under $50', '$50-$100', 'Over $100'];
  const ratings = ['All Ratings', '4.5 & Up', '4.0 & Up', '3.5 & Up', '3.0 & Up'];
  
  // Helper function to validate difficulty level
  const validateDifficultyLevel = (level: string | null): 'Beginner' | 'Intermediate' | 'Advanced' => {
    if (level === 'Beginner' || level === 'Intermediate' || level === 'Advanced') {
      return level;
    }
    return 'Beginner'; // Default fallback
  };
  
  const filteredCourses = allCourses.filter(course => {
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
  
  const FilterDropdown = ({ 
    options, 
    selected, 
    setSelected, 
    label 
  }: { 
    options: string[], 
    selected: string, 
    setSelected: (option: string) => void, 
    label: string 
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="relative">
        <button 
          className="flex items-center justify-between w-full px-4 py-2 bg-navy text-white rounded-lg border border-slate-700 hover:border-blue-light focus:outline-none focus:border-blue-light transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selected}</span>
          <ChevronDown size={16} className={cn("transition-transform", isOpen ? "rotate-180" : "")} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-navy border border-slate-700 rounded-lg shadow-xl">
            <div className="py-1 max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option}
                  className="flex items-center justify-between w-full px-4 py-2 text-left text-white hover:bg-slate-700 transition-colors"
                  onClick={() => {
                    setSelected(option);
                    setIsOpen(false);
                  }}
                >
                  <span>{option}</span>
                  {selected === option && <Check size={16} className="text-blue-light" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Combining loading states
  const loading = coursesLoading || categoriesLoading;
  
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
          
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center mb-6">
              <div className="relative flex-grow">
                <input 
                  type="text" 
                  placeholder="Search courses..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 pl-10 pr-4 rounded-lg bg-navy border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              </div>
              
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
            
            <div className="text-slate-400">
              Showing <span className="text-white font-medium">{filteredCourses.length}</span> courses
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="glass-card h-96 animate-pulse">
                  <div className="h-full rounded-xl bg-slate-800/50"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredCourses.length > 0 ? (
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
                        category: course.categories?.name || 'Development',
                        level: validateDifficultyLevel(course.difficulty_level),
                        duration: '30 hours',
                        students: 1000,
                        rating: course.overall_rating || 4.5,
                        price: course.price || 0
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <h3 className="text-xl font-bold mb-2">No courses found</h3>
                  <p className="text-slate-400 mb-6">Try adjusting your search criteria or browse all courses.</p>
                  <button 
                    className="button-primary"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All Categories');
                      setSelectedLevel('All Levels');
                      setSelectedPrice('All Prices');
                      setSelectedRating('All Ratings');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courses;
