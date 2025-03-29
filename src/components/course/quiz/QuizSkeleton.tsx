
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const QuizSkeleton: React.FC = () => {
  return (
    <div className="bg-navy/50 rounded-lg p-6">
      <Skeleton className="h-8 w-3/4 mb-6 bg-slate-700/50" />
      
      {[1, 2, 3].map((item) => (
        <div key={item} className="mb-6">
          <Skeleton className="h-6 w-full mb-4 bg-slate-700/50" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((option) => (
              <Skeleton key={option} className="h-5 w-full bg-slate-700/50" />
            ))}
          </div>
        </div>
      ))}
      
      <Skeleton className="h-10 w-32 mt-6 bg-slate-700/50" />
    </div>
  );
};

export default QuizSkeleton;
