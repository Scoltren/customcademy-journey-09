
import React, { useEffect } from 'react';
import { BookOpen, Play } from 'lucide-react';
import { Chapter } from '@/types/course';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseContentProps {
  chapters: Chapter[];
  courseId?: number;
  isLoading?: boolean;
}

const CourseContent: React.FC<CourseContentProps> = ({ 
  chapters, 
  courseId,
  isLoading = false 
}) => {
  // Log chapters data for debugging
  useEffect(() => {
    console.log('CourseContent chapters:', chapters);
  }, [chapters]);

  if (isLoading) {
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
  }

  return (
    <section className="container mx-auto px-6 mb-12">
      <h2 className="heading-md mb-6">Course Content</h2>
      
      {Array.isArray(chapters) && chapters.length > 0 ? (
        <div className="glass-card divide-y divide-slate-700/50">
          {chapters.map((chapter, index) => (
            <div key={chapter.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {chapter.title || `Chapter ${index + 1}`}
                  </h3>
                  <p className="text-slate-400 mb-4">
                    {chapter.chapter_text}
                  </p>
                  
                  {chapter.video_link && (
                    <div className="flex items-center gap-2 text-blue-light">
                      <Play size={16} />
                      <span>Video Lecture</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-8">
          <div className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No chapters available yet</h3>
            <p className="text-slate-400 mb-6">This course doesn't have any content available yet.</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default CourseContent;
