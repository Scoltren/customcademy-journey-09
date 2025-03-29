
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="glass-card h-96">
          <Skeleton className="h-full rounded-xl bg-slate-800/50" />
        </div>
      ))}
    </div>
  );
};

export default LoadingGrid;
