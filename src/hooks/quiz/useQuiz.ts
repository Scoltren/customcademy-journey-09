
import { useCallback, useEffect } from 'react';
import { useQuizState } from './useQuizState';
import { useQuizNavigation } from './useQuizNavigation';
import { toast } from 'sonner';

export const useQuiz = (user: any, quizIds: number[], categories: any[]) => {
  // Initialize quiz state manager
  const quizStateManager = useQuizState(quizIds);
  
  const {
    quizState,
    isLoading,
    currentCategory,
    currentQuestion,
    currentAnswers,
    selectedAnswerIds,
    isCompleted,
    handleSelectAnswer,
    updateScore,
    setIsLoading,
    setCurrentQuestion,
    setCurrentCategory,
    setIsCompleted,
    loadAnswersForQuestion,
    setSelectedAnswerIds
  } = quizStateManager;
  
  // Initialize quiz navigation with logging
  const logNavigation = useCallback((message: string, data?: any) => {
    console.log(`[Quiz Navigation] ${message}`, data || '');
  }, []);
  
  const logCurrentState = useCallback((state: any, quizIds: number[], categories: any[], savedQuizIds: number[]) => {
    console.log('[Quiz State]', {
      currentQuizIndex: state.currentQuizIndex,
      currentQuestionIndex: state.currentQuestionIndex,
      quizIds,
      categories,
      savedQuizIds
    });
  }, []);
  
  // Initialize quiz navigation with the state manager
  const {
    loadQuizData,
    handleNextQuestion,
    saveCurrentQuizResults
  } = useQuizNavigation(user, quizIds, categories, quizStateManager, logNavigation, logCurrentState);
  
  // Return all the necessary functions and state
  return {
    quizState,
    isLoading,
    currentCategory,
    currentQuestion,
    currentAnswers,
    selectedAnswerIds,
    handleSelectAnswer,
    handleNextQuestion,
    saveQuizResults: saveCurrentQuizResults,
    isCompleted,
    updateScore
  };
};
