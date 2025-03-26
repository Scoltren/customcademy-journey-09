
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard, { CourseProps } from '@/components/CourseCard';
import { Search, Filter, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample courses data
const allCourses: CourseProps[] = [
  {
    id: '1',
    title: 'Advanced Web Development Masterclass 2023',
    description: 'Learn modern web development with the latest technologies. This comprehensive course covers frontend, backend, and deployment.',
    instructor: 'Dr. Sarah Mitchell',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
    category: 'Web Development',
    level: 'Advanced',
    duration: '40 hours',
    students: 12543,
    rating: 4.9,
    price: 89.99
  },
  {
    id: '2',
    title: 'Machine Learning for Beginners',
    description: 'Your first step into the world of AI and machine learning. Perfect for beginners with basic programming knowledge.',
    instructor: 'Prof. Alex Johnson',
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'Data Science',
    level: 'Beginner',
    duration: '28 hours',
    students: 9872,
    rating: 4.7,
    price: 69.99
  },
  {
    id: '3',
    title: 'Digital Marketing Fundamentals',
    description: 'Master the essential skills needed for modern digital marketing. From SEO to social media strategies and analytics.',
    instructor: 'Emma Rodriguez',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80',
    category: 'Marketing',
    level: 'Intermediate',
    duration: '22 hours',
    students: 7654,
    rating: 4.5,
    price: 59.99
  },
  {
    id: '4',
    title: 'The Complete Mobile App Development',
    description: 'Create cross-platform mobile applications using React Native. Build and deploy for iOS and Android.',
    instructor: 'David Chen',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    category: 'Mobile Development',
    level: 'Intermediate',
    duration: '35 hours',
    students: 6321,
    rating: 4.8,
    price: 79.99
  },
  {
    id: '5',
    title: 'Cybersecurity Essentials',
    description: 'Protect yourself and your organization from cyber threats. Learn penetration testing, threat detection, and security best practices.',
    instructor: 'Michael Thompson',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'Cybersecurity',
    level: 'Advanced',
    duration: '30 hours',
    students: 5432,
    rating: 4.6,
    price: 99.99
  },
  {
    id: '6',
    title: 'Python Programming for Data Analysis',
    description: 'Learn Python programming with a focus on data analysis. Covers NumPy, Pandas, Matplotlib, and real-world applications.',
    instructor: 'Dr. Robert Lee',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
    category: 'Data Science',
    level: 'Intermediate',
    duration: '32 hours',
    students: 8765,
    rating: 4.8,
    price: 79.99
  },
  {
    id: '7',
    title: 'UX/UI Design Fundamentals',
    description: 'Master the principles of user experience and interface design. Create beautiful, functional, and user-friendly designs.',
    instructor: 'Sophia Wang',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'Design',
    level: 'Beginner',
    duration: '25 hours',
    students: 6543,
    rating: 4.7,
    price: 69.99
  },
  {
    id: '8',
    title: 'Frontend Web Development with React',
    description: 'Build dynamic user interfaces with React. Master components, state management, hooks, and modern frontend practices.',
    instructor: 'James Wilson',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'Web Development',
    level: 'Intermediate',
    duration: '30 hours',
    students: 7891,
    rating: 4.9,
    price: 84.99
  },
  {
    id: '9',
    title: 'Business Strategy and Management',
    description: 'Learn key business strategies and management techniques. Develop leadership skills and business acumen for career advancement.',
    instructor: 'Elizabeth Carter',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'Business',
    level: 'Intermediate',
    duration: '28 hours',
    students: 5432,
    rating: 4.6,
    price: 74.99
  }
];

// Filter options
const categories = [
  'All Categories',
  'Web Development', 
  'Data Science', 
  'Mobile Development', 
  'Cybersecurity', 
  'Marketing', 
  'Design', 
  'Business'
];

const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const prices = ['All Prices', 'Under $50', '$50-$100', '$100-$150', 'Over $150'];
const ratings = ['All Ratings', '4.5 & Up', '4.0 & Up', '3.5 & Up', '3.0 & Up'];

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedPrice, setSelectedPrice] = useState('All Prices');
  const [selectedRating, setSelectedRating] = useState('All Ratings');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter courses based on selections
  const filteredCourses = allCourses.filter(course => {
    // Search term filter
    if (searchTerm && !course.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !course.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory !== 'All Categories' && course.category !== selectedCategory) {
      return false;
    }
    
    // Level filter
    if (selectedLevel !== 'All Levels' && course.level !== selectedLevel) {
      return false;
    }
    
    // Price filter
    if (selectedPrice !== 'All Prices') {
      const price = course.price;
      if (selectedPrice === 'Under $50' && price >= 50) return false;
      if (selectedPrice === '$50-$100' && (price < 50 || price > 100)) return false;
      if (selectedPrice === '$100-$150' && (price < 100 || price > 150)) return false;
      if (selectedPrice === 'Over $150' && price <= 150) return false;
    }
    
    // Rating filter
    if (selectedRating !== 'All Ratings') {
      const minRating = parseFloat(selectedRating.split(' ')[0]);
      if (course.rating < minRating) return false;
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
                  setSelected={setSelectedRating} 
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
                setSelected={setSelectedRating} 
                label="Rating" 
              />
            </div>
            
            {/* Results count */}
            <div className="text-slate-400">
              Showing <span className="text-white font-medium">{filteredCourses.length}</span> courses
            </div>
          </div>
          
          {/* Courses grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
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
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courses;
