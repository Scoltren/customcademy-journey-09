
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface CourseProgressBarProps {
  progress: number;
}

const CourseProgressBar: React.FC<CourseProgressBarProps> = ({ progress }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">Progress:</span>
      <div className="w-64">
        <Progress value={progress} className="h-2" />
      </div>
      <span className="text-sm font-medium">{Math.round(progress)}%</span>
    </div>
  );
};

export default CourseProgressBar;
