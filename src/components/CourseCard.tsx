
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CourseProps {
  id: string;
  title: string;
  description: string;
  instructor: string;
  image: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  students: number;
  rating: number;
  price: number;
  featured?: boolean;
}

const CourseCard: React.FC<{ course: CourseProps; className?: string }> = ({ 
  course, 
  className 
}) => {
  const {
    id,
    title,
    description,
    instructor,
    image,
    category,
    level,
    duration,
    students,
    rating,
    price,
    featured
  } = course;

  const levelColor = {
    Beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
    Intermediate: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Advanced: 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  return (
    <Link 
      to={`/course/${id}`} 
      className={cn(
        "glass-card overflow-hidden group transition-all duration-500 flex flex-col card-hover",
        featured ? "md:col-span-2 md:flex-row" : "",
        className
      )}
    >
      <div className={cn(
        "relative overflow-hidden",
        featured ? "md:w-1/2" : "w-full"
      )}>
        <div className="aspect-video w-full h-full overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20 text-xs font-medium">
            {category}
          </span>
          <span className={cn(
            "py-1 px-3 rounded-full text-xs font-medium border",
            levelColor[level]
          )}>
            {level}
          </span>
        </div>
      </div>
      
      <div className={cn(
        "p-6 flex flex-col flex-grow",
        featured ? "md:w-1/2" : ""
      )}>
        <h3 className="text-xl font-bold mb-2 line-clamp-2 text-white group-hover:text-blue-light transition-colors duration-300">
          {title}
        </h3>
        <p className="text-slate-400 mb-4 text-sm line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
            <img 
              src={`https://ui-avatars.com/api/?name=${instructor.replace(' ', '+')}&background=random`} 
              alt={instructor} 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-slate-300 text-sm">{instructor}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            <span className="text-slate-300 text-sm">{duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-400" />
            <span className="text-slate-300 text-sm">{students.toLocaleString()} students</span>
          </div>
          <div className="flex items-center gap-2">
            <Star size={16} className="text-yellow-500" />
            <span className="text-slate-300 text-sm">{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-slate-400" />
            <span className="text-slate-300 text-sm">10 modules</span>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-slate-700 flex items-center justify-between">
          <span className="text-xl font-bold text-white">${price.toFixed(2)}</span>
          <div className="button-primary py-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            View Course
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
