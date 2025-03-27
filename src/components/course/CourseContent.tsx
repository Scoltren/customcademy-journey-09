
import React, { useState, useEffect } from 'react';
import { BookOpen, Play, FileCheck, CheckCircle, Lock } from 'lucide-react';
import { Chapter } from '@/types/course';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import QuizComponent from './QuizComponent';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface CourseContentProps {
  chapters: Chapter[];
  courseId?: number;
  isLoading?: boolean;
  progress?: number;
}

const CourseContent: React.FC<CourseContentProps> = ({ 
  chapters, 
  courseId,
  isLoading = false,
  progress = 0
}) => {
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const { id } = useParams<{ id: string }>();
  const { user, isEnrolled } = useAuth();
  const [userEnrolled, setUserEnrolled] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEnrollment = async () => {
      if (user && id) {
        const enrolled = await isEnrolled(id);
        setUserEnrolled(enrolled);
      }
    };

    checkEnrollment();
  }, [user, id, isEnrolled]);
  
  // Toggle quiz visibility
  const handleToggleQuiz = (quizId: number | null) => {
    setActiveQuiz(activeQuiz === quizId ? null : quizId);
  };

  // Mark chapter as completed
  const handleMarkAsDone = async (chapterId: number, progressValue: number | null) => {
    if (!id || !progressValue || !user) {
      toast.error('You must be logged in to track progress');
      return;
    }
    
    try {
      // First check if user is already subscribed to this course
      const { data: existingSubscription, error: checkError } = await supabase
        .from('subscribed_courses')
        .select('*')
        .eq('course_id', parseInt(id))
        .eq('user_id', user.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingSubscription) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('subscribed_courses')
          .update({ 
            progress: (existingSubscription.progress || 0) + progressValue 
          })
          .eq('course_id', parseInt(id))
          .eq('user_id', user.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new subscription
        const { error: insertError } = await supabase
          .from('subscribed_courses')
          .insert({
            course_id: parseInt(id),
            user_id: user.id,
            progress: progressValue
          });
        
        if (insertError) throw insertError;
      }
      
      // Update UI to show chapter as completed
      setCompletedChapters(prev => [...prev, chapterId]);
      toast.success("Chapter marked as completed!");
      
    } catch (error) {
      console.error("Error marking chapter as completed:", error);
      toast.error("Failed to mark chapter as completed");
    }
  };

  const handleLoginRedirect = () => {
    toast.info('Please log in to access course content');
    navigate('/login');
  };

  const handleEnrollRedirect = () => {
    toast.info('You need to enroll in this course to access its content');
    const courseSection = document.querySelector('.course-header');
    if (courseSection) {
      courseSection.scrollIntoView({ behavior: 'smooth' });
    }
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

  if (!user) {
    return (
      <section className="container mx-auto px-6 mb-12">
        <h2 className="heading-md mb-6">Course Content</h2>
        <div className="glass-card p-8 text-center">
          <Lock className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">Login Required</h3>
          <p className="text-slate-400 mb-6">You need to be logged in to view course content.</p>
          <Button onClick={handleLoginRedirect} className="button-primary">
            Login to Continue
          </Button>
        </div>
      </section>
    );
  }

  if (!userEnrolled) {
    return (
      <section className="container mx-auto px-6 mb-12">
        <h2 className="heading-md mb-6">Course Content</h2>
        <div className="glass-card p-8 text-center">
          <Lock className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">Enrollment Required</h3>
          <p className="text-slate-400 mb-6">You need to enroll in this course to access its content.</p>
          <Button onClick={handleEnrollRedirect} className="button-primary">
            Enroll Now
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-6 mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading-md">Course Content</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Progress:</span>
          <div className="w-64">
            <Progress value={progress} className="h-2" />
          </div>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
      </div>
      
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
                      
                      {!completedChapters.includes(chapter.id) && (
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2 border-green-500 text-green-500 hover:bg-green-500/10"
                          onClick={() => handleMarkAsDone(chapter.id, chapter.progress_when_finished)}
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
