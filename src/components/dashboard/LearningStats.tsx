
import React from 'react';

interface LearningStatsProps {
  enrolledCourses: any[];
}

const LearningStats = ({ enrolledCourses }: LearningStatsProps) => {
  // Calculate total completed chapters across all courses
  const totalCompletedChapters = enrolledCourses.reduce((total, course) => 
    total + course.completedChapters, 0);
  
  // Calculate total chapters across all courses
  const totalChapters = enrolledCourses.reduce((total, course) => 
    total + course.totalChapters, 0);
  
  return (
    <>
      <h3 className="font-bold text-white mb-4 mt-6">Learning Stats</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Total Courses</span>
            <span className="text-white font-medium">{enrolledCourses.length}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '100%' }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">In Progress</span>
            <span className="text-white font-medium">
              {enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length}
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${(enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length / Math.max(1, enrolledCourses.length)) * 100}%` 
              }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Completed</span>
            <span className="text-white font-medium">
              {enrolledCourses.filter(c => c.progress === 100).length}
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${(enrolledCourses.filter(c => c.progress === 100).length / Math.max(1, enrolledCourses.length)) * 100}%` 
              }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Chapters Completed</span>
            <span className="text-white font-medium">
              {totalCompletedChapters}/{totalChapters}
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${totalChapters > 0 ? (totalCompletedChapters / totalChapters) * 100 : 0}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LearningStats;
