
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, BookOpen, Award } from 'lucide-react';

interface CourseProgressBarProps {
  progress: number;
}

const CourseProgressBar: React.FC<CourseProgressBarProps> = ({ progress }) => {
  // Ensure progress is a valid number between 0-100
  const validProgress = isNaN(progress) ? 0 : Math.min(Math.max(progress, 0), 100);
  
  // Determine the progress status for visual feedback
  const getProgressStatus = () => {
    if (validProgress === 100) return 'completed';
    if (validProgress >= 75) return 'advanced';
    if (validProgress >= 50) return 'halfway';
    if (validProgress > 0) return 'started';
    return 'not-started';
  };
  
  const status = getProgressStatus();
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-400">Progress:</span>
      <div className="w-64 relative">
        <Progress 
          value={validProgress} 
          className={`h-2.5 ${
            status === 'completed' ? 'bg-slate-700 [&>div]:bg-green-500' : 
            status === 'advanced' ? 'bg-slate-700 [&>div]:bg-blue-500' : 
            status === 'halfway' ? 'bg-slate-700 [&>div]:bg-blue-400' :
            status === 'started' ? 'bg-slate-700 [&>div]:bg-blue-400' :
            'bg-slate-700 [&>div]:bg-slate-600'
          }`} 
        />
      </div>
      <div className="flex items-center gap-1">
        {status === 'completed' ? (
          <CheckCircle2 size={16} className="text-green-500" />
        ) : status === 'advanced' ? (
          <Award size={16} className="text-blue-500" />
        ) : (
          <BookOpen size={16} className={status !== 'not-started' ? "text-blue-400" : "text-slate-400"} />
        )}
        <span className={`text-sm font-medium ${
          status === 'completed' ? 'text-green-500' : 
          status === 'advanced' ? 'text-blue-500' : 
          status === 'halfway' ? 'text-blue-400' :
          status === 'started' ? 'text-blue-400' :
          'text-slate-400'
        }`}>
          {Math.round(validProgress)}%
        </span>
      </div>
    </div>
  );
};

export default CourseProgressBar;
