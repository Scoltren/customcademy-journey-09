
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Chapter } from '@/types/course';

// Import refactored components and hooks
import ChapterList from './content/ChapterList';
import LoadingChapters from './content/LoadingChapters';
import CourseProgressBar from './content/CourseProgressBar';
import EnrollmentManager from './content/EnrollmentManager';
import { useChapterProgress } from '@/hooks/useChapterProgress';

interface CourseContentProps {
  chapters: Chapter[];
  courseId?: number;
  isLoading?: boolean;
  progress?: number;
}

// Component that displays course content with chapters and progress tracking
const CourseContent: React.FC<CourseContentProps> = ({ 
  chapters, 
  courseId,
  isLoading = false,
  progress = 0
}) => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  // Custom hook to manage chapter completion tracking
  const { 
    completedChapters, 
    localProgress, 
    setLocalProgress, 
    markChapterAsDone 
  } = useChapterProgress(user?.id, id);

  // Update local progress state ONLY when the progress prop changes from the parent
  useEffect(() => {
    setLocalProgress(progress);
  }, [progress, setLocalProgress]);

  // Show loading state while chapters are being fetched
  if (isLoading) {
    return <LoadingChapters />;
  }

  return (
    <section className="container mx-auto px-6 mb-12">
      {/* EnrollmentManager checks if user is enrolled before showing content */}
      <EnrollmentManager courseId={id}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="heading-md">Course Content</h2>
          <CourseProgressBar progress={localProgress} />
        </div>
        
        {/* List of chapters with completion tracking */}
        <ChapterList 
          chapters={chapters}
          completedChapters={completedChapters}
          onMarkAsDone={markChapterAsDone}
        />
      </EnrollmentManager>
    </section>
  );
};

export default CourseContent;
