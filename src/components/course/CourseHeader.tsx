
import React, { useState, useEffect } from 'react';
import { Star, Users, Clock, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Course } from '@/types/course';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface CourseHeaderProps {
  course: Course;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  const { user, isEnrolled } = useAuth();
  const [enrollmentStatus, setEnrollmentStatus] = useState<boolean>(false);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEnrollment = async () => {
      if (user && course.id) {
        const status = await isEnrolled(course.id);
        setEnrollmentStatus(status);
      }
    };

    checkEnrollment();
  }, [user, course.id, isEnrolled]);

  const handleEnroll = async () => {
    if (!user) {
      toast.info('Please log in to enroll in this course');
      navigate('/login');
      return;
    }

    setIsEnrolling(true);
    try {
      const { error } = await supabase
        .from('subscribed_courses')
        .insert({
          course_id: course.id,
          user_id: user.id,
          progress: 0
        });

      if (error) throw error;
      
      setEnrollmentStatus(true);
      toast.success('Successfully enrolled in the course');
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in the course');
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="glass-card p-8 md:p-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Course Image */}
        <div className="lg:w-1/2">
          <div className="aspect-video rounded-xl overflow-hidden bg-slate-800">
            <img 
              src={course.thumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"}
              alt={course.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Course Info */}
        <div className="lg:w-1/2">
          <h1 className="heading-lg mb-4">{course.title}</h1>
          
          <div className="text-slate-400 mb-6">
            {course.description}
          </div>
          
          {/* Course Meta */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" size={18} />
              <span>{course.overall_rating ? course.overall_rating.toFixed(1) : '0.0'} Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="text-blue-400" size={18} />
              <span>1000+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-green-400" size={18} />
              <span>{course.course_time || 0} Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart className="text-purple-400" size={18} />
              <span>{course.difficulty_level || 'Intermediate'}</span>
            </div>
          </div>
          
          {/* Price and Enroll Button */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700">
            <div className="text-2xl font-bold">
              {course.price ? `$${course.price}` : 'Free'}
            </div>
            {enrollmentStatus ? (
              <Button 
                className="button-secondary"
                disabled
              >
                Enrolled
              </Button>
            ) : (
              <Button 
                className="button-primary"
                onClick={handleEnroll}
                disabled={isEnrolling}
              >
                {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
