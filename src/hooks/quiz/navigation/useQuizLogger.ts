
import { useCallback } from 'react';

// Custom hook for logging quiz navigation events
export const useQuizLogger = () => {
  // Log function to help track quiz navigation
  const logNavigation = useCallback((message: string, data?: any) => {
    console.log(`[QuizNavigation] ${message}`, data ? data : '');
  }, []);
  
  // Debug function to log the current state
  const logCurrentState = useCallback((
    quizState: any,
    quizIds: number[],
    categories: any[],
    savedQuizIds: number[]
  ) => {
    logNavigation('Current State:', {
      quizIds,
      currentQuizIndex: quizState.currentQuizIndex,
      currentQuizId: quizIds[quizState.currentQuizIndex],
      currentCategory: categories[quizState.currentQuizIndex]?.name,
      currentQuestionIndex: quizState.currentQuestionIndex,
      totalQuestions: quizState.questions.length,
      savedQuizIds
    });
  }, [logNavigation]);
  
  return {
    logNavigation,
    logCurrentState,
  };
};
