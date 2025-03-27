
import React from 'react';
import { BookOpen } from 'lucide-react';
import { Chapter } from '@/types/course';
import ChapterItem from './ChapterItem';

interface ChapterListProps {
  chapters: Chapter[];
  activeQuiz: number | null;
  completedChapters: number[];
  onToggleQuiz: (quizId: number | null) => void;
  onMarkAsDone: (chapterId: number, progressValue: number | null) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  activeQuiz,
  completedChapters,
  onToggleQuiz,
  onMarkAsDone
}) => {
  if (!Array.isArray(chapters) || chapters.length === 0) {
    return (
      <div className="glass-card p-8">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">No chapters available yet</h3>
          <p className="text-slate-400 mb-6">This course doesn't have any content available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card divide-y divide-slate-700/50">
      {chapters.map((chapter, index) => (
        <ChapterItem
          key={chapter.id}
          chapter={chapter}
          index={index}
          activeQuiz={activeQuiz}
          completedChapters={completedChapters}
          onToggleQuiz={onToggleQuiz}
          onMarkAsDone={onMarkAsDone}
        />
      ))}
    </div>
  );
};

export default ChapterList;
