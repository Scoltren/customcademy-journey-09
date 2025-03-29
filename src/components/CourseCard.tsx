
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
        "glass-card overflow-hidden group transition-all duration-500 flex flex-col card-hover h-[360px]",
        featured ? "md:col-span-2 md:flex-row md:h-[280px]" : "",
        className
      )}
    >
      <div className={cn(
        "relative overflow-hidden h-[55%]",
        featured ? "md:w-1/2 md:h-full" : "w-full"
      )}>
        <div className="w-full h-full overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
      
      <div className={cn(
        "p-4 flex flex-col flex-grow bg-midnight",
        featured ? "md:w-1/2" : ""
      )}>
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge className="bg-blue-900 hover:bg-blue-800 text-white border-0 font-medium text-xs">
            {category}
          </Badge>
          <Badge className={cn(
            "border text-xs",
            level === 'Beginner' ? 'bg-green-600/80 hover:bg-green-600 text-white border-0' :
            level === 'Intermediate' ? 'bg-orange-500/80 hover:bg-orange-500 text-white border-0' :
            'bg-red-600/80 hover:bg-red-600 text-white border-0'
          )}>
            {level}
          </Badge>
        </div>
        
        <h3 className="text-sm font-bold mb-1 line-clamp-1 text-white group-hover:text-blue-light transition-colors duration-300">
          {title}
        </h3>
        
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Clock size={14} className="text-slate-400" />
            <span className="text-slate-300">{duration}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <BookOpen size={14} className="text-slate-400" />
            <span className="text-slate-300">{chapterCount}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Star size={14} className="text-yellow-500" />
            <span className="text-slate-300">{rating ? rating.toFixed(1) : 'N/A'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
