
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { Search, Filter, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { courseApi, categoryApi } from '@/services/api';
import { toast } from '@/components/ui/sonner';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedPrice, setSelectedPrice] = useState('All Prices');
  const [selectedRating, setSelectedRating] = useState('All Ratings');
  const [showFilters, setShowFilters] = useState(false);
  
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All Categories']);
  const [loading, setLoading] = useState(true);
  
  // Fetch courses and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses
        const coursesData = await courseApi.getCourses();
        setAllCourses(coursesData);
        
        // Fetch categories
        const categoriesData = await categoryApi.getCategories();
        setCategories([
          'All Categories', 
          ...categoriesData.map(cat => cat.name)
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load courses data');
        // Use empty arrays if API fails
        setAllCourses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter options
  const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
  const prices = ['All Prices', 'Free', 'Under $50', '$50-$100', 'Over $100'];
  const ratings = ['All Ratings', '4.5 & Up', '4.0 & Up', '3.5 & Up', '3.0 & Up'];
  
  // Filter courses based on selections
  const filteredCourses = allCourses.filter(course => {
    // Search term filter
    if (searchTerm && 
        !course.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !course.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory !== 'All Categories' && course.category_name !== selectedCategory) {
      return false;
    }
    
    // Level filter
    if (selectedLevel !== 'All Levels' && course.difficulty_level !== selectedLevel) {
      return false;
    }
    
    // Price filter
    if (selectedPrice !== 'All Prices') {
      const price = course.price || 0;
      if (selectedPrice === 'Free' && price > 0) return false;
      if (selectedPrice === 'Under $50' && (price >= 50)) return false;
      if (selectedPrice === '$50-$100' && (price < 50 || price > 100)) return false;
      if (selectedPrice === 'Over $100' && price <= 100) return false;
    }
    
    // Rating filter
    if (selectedRating !== 'All Ratings') {
      const minRating = parseFloat(selectedRating.split(' ')[0]);
      if ((course.overall_rating || 0) < minRating) return false;
    }
    
    return true;
  });
  
  // Filter dropdown component
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
  
  return (
    <div className="min-h-screen bg-midnight">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <h1 className="heading-lg mb-4">Explore Our Courses</h1>
            <p className="text-slate-400 max-w-3xl">
              Browse our comprehensive collection of courses across various categories. 
              Filter by topic, difficulty level, or search for specific courses to find 
              the perfect match for your learning journey.
            </p>
          </div>
          
          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center mb-6">
              {/* Search bar */}
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
              
              {/* Mobile filter button */}
              <button 
                className="lg:hidden button-secondary flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                Filters
              </button>
              
              {/* Desktop filters */}
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
                  setSelectedRating={setSelectedRating} 
                  label="Rating" 
                />
              </div>
            </div>
            
            {/* Mobile filters */}
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
                setSelectedRating={setSelectedRating} 
                label="Rating" 
              />
            </div>
            
            {/* Results count */}
            <div className="text-slate-400">
              Showing <span className="text-white font-medium">{filteredCourses.length}</span> courses
            </div>
          </div>
          
          {/* Loading state */}
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
              {/* Courses grid */}
              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCourses.map((course) => (
                    <CourseCard 
                      key={course.id} 
                      course={{
                        id: course.id.toString(),
                        title: course.title,
                        description: course.description || "",
                        instructor: 'Instructor', // You may need to update this based on your API
                        image: course.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
                        category: course.category_name || 'Development',
                        level: course.difficulty_level || 'Beginner',
                        duration: '30 hours', // You may need to update this based on your API
                        students: 1000, // You may need to update this based on your API
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
