
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Database, LineChart, Briefcase, Brain, Palette, Video, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  courseCount: number;
  color: string;
}

const categories: Category[] = [
  {
    id: 'web-dev',
    name: 'Web Development',
    description: 'Frontend, backend, and full-stack web development',
    icon: Code,
    courseCount: 120,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'data-science',
    name: 'Data Science',
    description: 'Data analysis, visualization, and machine learning',
    icon: Database,
    courseCount: 85,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Entrepreneurship, marketing, and management',
    icon: Briefcase,
    courseCount: 95,
    color: 'from-amber-500 to-amber-600'
  },
  {
    id: 'data-analytics',
    name: 'Data Analytics',
    description: 'Business intelligence, statistics, and data insights',
    icon: LineChart,
    courseCount: 70,
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'artificial-intelligence',
    name: 'AI & Machine Learning',
    description: 'Neural networks, deep learning, and AI applications',
    icon: Brain,
    courseCount: 55,
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'design',
    name: 'Design',
    description: 'UI/UX, graphic design, and product design',
    icon: Palette,
    courseCount: 80,
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'video-production',
    name: 'Video Production',
    description: 'Video editing, animation, and motion graphics',
    icon: Video,
    courseCount: 45,
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'personal-development',
    name: 'Personal Development',
    description: 'Productivity, leadership, and communication skills',
    icon: BookOpen,
    courseCount: 110,
    color: 'from-cyan-500 to-cyan-600'
  },
];

const CategorySection = () => {
  return (
    <section className="section-padding bg-navy/50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20 text-sm font-medium mb-4">
              Browse by Category
            </span>
            <h2 className="heading-lg">Discover Your <span className="text-gradient">Perfect Course</span></h2>
          </div>
          
          <Link to="/categories" className="button-secondary flex items-center gap-2 mt-4 md:mt-0">
            All Categories <ArrowRight size={18} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={`/courses?category=${category.id}`}
              className="glass-card p-6 card-hover group"
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 text-white",
                category.color
              )}>
                <category.icon size={24} />
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-light transition-colors duration-300">
                {category.name}
              </h3>
              
              <p className="text-slate-400 mb-4 text-sm">
                {category.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">{category.courseCount} courses</span>
                <ArrowRight size={18} className="text-blue-light opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
