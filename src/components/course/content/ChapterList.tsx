
import React from 'react';
import { BookOpen } from 'lucide-react';
import { Chapter } from '@/types/course';
import ChapterItem from './ChapterItem';

interface ChapterListProps {
  chapters: Chapter[];
  completedChapters: number[];
  onMarkAsDone: (chapterId: number, progressValue: number | null) => void;
}

// Component that displays the list of chapters for a course
const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  completedChapters,
  onMarkAsDone
}) => {
  // Show empty state when there are no chapters
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

  // Render list of chapters with completion tracking
  return (
    <div className="glass-card divide-y divide-slate-700/50">
      {chapters.map((chapter, index) => (
        <ChapterItem
          key={chapter.id}
          chapter={chapter}
          index={index}
          completedChapters={completedChapters}
          onMarkAsDone={onMarkAsDone}
        />
      ))}
    </div>
  );
};

export default ChapterList;
