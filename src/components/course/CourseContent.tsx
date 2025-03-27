
import React, { useState } from 'react';
import { BookOpen, Play, FileCheck } from 'lucide-react';
import { Chapter } from '@/types/course';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import QuizComponent from './QuizComponent';

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
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null);

  // Toggle quiz visibility
  const handleToggleQuiz = (quizId: number | null) => {
    setActiveQuiz(activeQuiz === quizId ? null : quizId);
  };

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
                <div className="w-full">
                  <h3 className="text-xl font-bold mb-2">
                    {chapter.title || chapter.chapter_text}
                  </h3>
                  <p className="text-slate-400 mb-4">
                    {chapter.chapter_text}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {chapter.video_link && (
                        <a 
                          href={chapter.video_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-light hover:text-blue transition-colors"
                        >
                          <Play size={16} />
                          <span>Watch Video Lecture</span>
                        </a>
                      )}
                    </div>
                    
                    {chapter.quiz_id && (
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 border-blue-light text-blue-light hover:bg-blue-light/10"
                        onClick={() => handleToggleQuiz(chapter.quiz_id as number)}
                      >
                        <FileCheck size={16} />
                        {activeQuiz === chapter.quiz_id ? 'Hide Quiz' : 'Take Quiz'}
                      </Button>
                    )}
                  </div>
                  
                  {activeQuiz === chapter.quiz_id && chapter.quiz_id && (
                    <div className="mt-6">
                      <QuizComponent quizId={chapter.quiz_id} />
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
