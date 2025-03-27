
import React from 'react';
import { Play, CheckCircle, FileCheck } from 'lucide-react';
import { Chapter } from '@/types/course';
import { Button } from '@/components/ui/button';
import QuizComponent from '../QuizComponent';

interface ChapterItemProps {
  chapter: Chapter;
  index: number;
  activeQuiz: number | null;
  completedChapters: number[];
  onToggleQuiz: (quizId: number | null) => void;
  onMarkAsDone: (chapterId: number, progressValue: number | null) => void;
}

const ChapterItem: React.FC<ChapterItemProps> = ({
  chapter,
  index,
  activeQuiz,
  completedChapters,
  onToggleQuiz,
  onMarkAsDone
}) => {
  return (
    <div className="p-6">
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
              
              {!completedChapters.includes(chapter.id) && (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-green-500 text-green-500 hover:bg-green-500/10"
                  onClick={() => onMarkAsDone(chapter.id, chapter.progress_when_finished)}
                >
                  <CheckCircle size={16} />
                  Mark as Done
                </Button>
              )}
              
              {completedChapters.includes(chapter.id) && (
                <span className="flex items-center gap-2 text-green-500">
                  <CheckCircle size={16} />
                  Completed
                </span>
              )}
            </div>
            
            {chapter.quiz_id && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2 border-blue-light text-blue-light hover:bg-blue-light/10"
                onClick={() => onToggleQuiz(chapter.quiz_id as number)}
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
  );
};

export default ChapterItem;
