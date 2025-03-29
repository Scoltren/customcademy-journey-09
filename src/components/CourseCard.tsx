
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
  chapterCount?: number;
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
    rating,
    price,
    featured,
    chapterCount = 0
  } = course;

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
      </div>
      
      <div className={cn(
        "p-6 flex flex-col flex-grow bg-navy/90",
        featured ? "md:w-1/2" : ""
      )}>
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge className="bg-blue-800 hover:bg-blue-700 text-white border-0 font-medium">
            {category}
          </Badge>
          <Badge className={cn(
            "border",
            level === 'Beginner' ? 'bg-green-600/80 hover:bg-green-600 text-white border-0' :
            level === 'Intermediate' ? 'bg-orange-500/80 hover:bg-orange-500 text-white border-0' :
            'bg-red-600/80 hover:bg-red-600 text-white border-0'
          )}>
            {level}
          </Badge>
        </div>
        
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
        
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            <span className="text-slate-300 text-sm">{duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star size={16} className="text-yellow-500" />
            <span className="text-slate-300 text-sm">{rating ? rating.toFixed(1) : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-slate-400" />
            <span className="text-slate-300 text-sm">{chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}</span>
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
