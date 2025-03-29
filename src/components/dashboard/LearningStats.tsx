
import React from 'react';

interface LearningStatsProps {
  enrolledCourses: any[];
}

const LearningStats = ({ enrolledCourses }: LearningStatsProps) => {
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
      </div>
    </>
  );
};

export default LearningStats;
