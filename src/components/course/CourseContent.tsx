
import React, { useEffect } from 'react';
import { BookOpen, Play } from 'lucide-react';
import { Chapter } from '@/types/course';

interface CourseContentProps {
  chapters: Chapter[];
}

const CourseContent: React.FC<CourseContentProps> = ({ chapters }) => {
  // Log chapters data for debugging
  useEffect(() => {
    console.log('CourseContent chapters:', chapters);
  }, [chapters]);

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
        <div className="glass-card p-8 text-center">
          <p className="text-slate-400">No content available for this course yet.</p>
        </div>
      )}
    </section>
  );
};

export default CourseContent;
