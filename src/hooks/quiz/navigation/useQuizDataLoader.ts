
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Custom hook for loading quiz data
export const useQuizDataLoader = (
  quizStateManager: any,
  logNavigation: (message: string, data?: any) => void,
  logCurrentState: (quizState: any, quizIds: number[], categories: any[], savedQuizIds: number[]) => void
) => {
  const {
    quizState, 
    setQuizState, 
    setIsLoading, 
    setCurrentQuestion, 
    setCurrentCategory, 
    setIsCompleted,
    loadAnswersForQuestion
  } = quizStateManager;
  
  // Load the current quiz questions and first question's answers
  const loadQuizData = useCallback(async (
    quizIds: number[],
    categories: any[],
    savedQuizIds: number[]
  ) => {
    if (!quizIds.length) {
      logNavigation('No quiz IDs provided');
      setIsCompleted(true);
      return;
    }
    
    if (quizState.currentQuizIndex >= quizIds.length) {
      logNavigation(`Quiz index out of bounds: ${quizState.currentQuizIndex} >= ${quizIds.length}`);
      setIsCompleted(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentQuizId = quizIds[quizState.currentQuizIndex];
      
      logNavigation(`Loading quiz ${quizState.currentQuizIndex + 1}/${quizIds.length}: Quiz ID ${currentQuizId}`);
      
      // Set current category
      const currentCategory = categories[quizState.currentQuizIndex] || null;
      setCurrentCategory(currentCategory);
      logNavigation(`Current category set to:`, currentCategory);
      
      // Fetch questions for the current quiz
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', currentQuizId);
      
      if (questionsError) throw questionsError;
      
      if (!questions || !questions.length) {
        toast.error("No questions available for this quiz");
        logNavigation(`No questions found for quiz ${currentQuizId}, moving to next quiz`);
        
        // Instead of recursively calling loadQuizData, let's update state and let React effect handle it
        if (quizState.currentQuizIndex < quizIds.length - 1) {
          setQuizState(prev => ({
            ...prev,
            currentQuizIndex: prev.currentQuizIndex + 1
          }));
        } else {
          setIsCompleted(true);
        }
        setIsLoading(false);
        return;
      }
      
      logNavigation(`Loaded ${questions.length} questions for quiz ${currentQuizId}`);
      
      // Set questions and current question
      setQuizState(prev => ({
        ...prev,
        questions: questions,
        currentQuestionIndex: 0,
        score: 0 // Reset score for new quiz
      }));
      
      setCurrentQuestion(questions[0]);
      
      // Load answers for the first question
      await loadAnswersForQuestion(questions[0].id);
      
      logCurrentState(quizState, quizIds, categories, savedQuizIds);
      
    } catch (error) {
      console.error("Error loading quiz data:", error);
      toast.error("Failed to load quiz");
      
      // Let the calling component handle load attempt counting
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [
    quizState, 
    setQuizState, 
    setIsLoading, 
    setCurrentQuestion, 
    setCurrentCategory, 
    setIsCompleted, 
    loadAnswersForQuestion, 
    logNavigation, 
    logCurrentState
  ]);
  
  return {
    loadQuizData
  };
};
