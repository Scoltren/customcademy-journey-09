
import { useCourseDetails } from './course/useCourseDetails';
import { useCourseChapters } from './course/useCourseChapters';
import { useCourseComments } from './course/useCourseComments';
import { useCourseProgress } from './course/useCourseProgress';

export const useCourseData = () => {
  // Use the individual hooks
  const { course, isLoading: courseLoading, error: courseError } = useCourseDetails();
  const { chapters, isLoading: chaptersLoading, error: chaptersError } = useCourseChapters();
  const { 
    comments, 
    isLoading: commentsLoading, 
    error: commentsError,
    refetchComments 
  } = useCourseComments();
  const { 
    courseProgress, 
    isLoading: progressLoading, 
    error: progressError,
    refetchProgress 
  } = useCourseProgress();

  // Determine overall loading state
  const isLoading = courseLoading || chaptersLoading || commentsLoading || progressLoading;

  return {
    course,
    chapters,
    comments,
    isLoading,
    courseError,
    chaptersError,
    commentsError,
    courseProgress,
    refetchProgress,
    refetchComments
  };
};
