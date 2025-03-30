
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface CourseProgressBarProps {
  progress: number;
}

const CourseProgressBar: React.FC<CourseProgressBarProps> = ({ progress }) => {
  // Ensure progress is a valid number between 0-100
  const validProgress = isNaN(progress) ? 0 : Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">Progress:</span>
      <div className="w-64">
        <Progress value={validProgress} className="h-2" />
      </div>
      <span className="text-sm font-medium">{Math.round(validProgress)}%</span>
    </div>
  );
};

export default CourseProgressBar;
