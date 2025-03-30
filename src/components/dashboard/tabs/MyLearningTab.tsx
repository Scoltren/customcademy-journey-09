
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock } from 'lucide-react';
import { Course } from '@/types/course';
import UserInterests from '../UserInterests';

interface MyLearningTabProps {
  enrolledCourses: (Course & {progress: number, completedChapters: number, totalChapters: number})[];
  isLoading: boolean;
  userInterests: any[];
  handleEditInterests: () => void;
}

const MyLearningTab = ({ 
  enrolledCourses,
  isLoading,
  userInterests,
  handleEditInterests
}: MyLearningTabProps) => {
  
  return (
    <div>
      <h1 className="heading-lg mb-6">My Learning</h1>
      
      {isLoading ? (
        <div className="glass-card p-6 text-center">
          <p className="text-white">Loading your courses...</p>
        </div>
      ) : enrolledCourses.length > 0 ? (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Your Courses</h2>
            <Link to="/courses" className="text-blue-light hover:text-blue flex items-center gap-1">
              Find more courses
            </Link>
          </div>
          
          <div className="space-y-6">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="glass-card overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 h-48 md:h-auto">
                    <img 
                      src={course.thumbnail || '/placeholder.svg'} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-6 flex-grow">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          <Link to={`/course/${course.id}`} className="hover:text-blue-light transition-colors">
                            {course.title}
                          </Link>
                        </h3>
                        <p className="text-slate-400">{course.difficulty_level || 'All Levels'}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white">{course.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <BookOpen size={16} className="text-blue-light" />
                        <span className="text-slate-300">
                          {course.completedChapters}/{course.totalChapters} lessons
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} className="text-blue-light" />
                        <span className="text-slate-300">
                          {course.course_time || course.totalChapters} minutes
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Link 
                        to={`/course/${course.id}/learn`}
                        className="button-primary py-2 px-4"
                      >
                        Continue Learning
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-3">You haven't enrolled in any courses yet</h3>
          <p className="text-slate-400 mb-6">Explore our course catalog to find something that interests you</p>
          <Link to="/courses" className="button-primary py-2 px-6">Browse Courses</Link>
        </div>
      )}
      
      {/* Your Interests Section (Mobile only) */}
      <div className="mt-8 lg:hidden">
        <UserInterests 
          userInterests={userInterests}
          handleEditInterests={handleEditInterests}
        />
      </div>
    </div>
  );
};

export default MyLearningTab;
