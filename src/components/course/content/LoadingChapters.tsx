
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingChapters: React.FC = () => {
  return (
    <section className="container mx-auto px-6 mb-12">
      <h2 className="heading-md mb-6">Course Content</h2>
      <div className="glass-card">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 border-b border-slate-700/50 last:border-b-0">
            <div className="flex items-start gap-4">
              <Skeleton className="w-8 h-8 rounded-full bg-slate-700/50" />
              <div className="w-full">
                <Skeleton className="h-6 w-2/3 mb-2 bg-slate-700/50" />
                <Skeleton className="h-4 w-full mb-2 bg-slate-700/50" />
                <Skeleton className="h-4 w-1/2 bg-slate-700/50" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LoadingChapters;
