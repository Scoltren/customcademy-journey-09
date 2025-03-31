
import { useCallback } from 'react';
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
  
  // Logging utilities for debugging
  const logNavigation = useCallback((message: string, data?: any) => {
    console.log(`[Quiz Navigation] ${message}`, data || '');
  }, []);
  
  const logCurrentState = useCallback((state: any, quizIdsArray: number[], categoriesArray: any[], savedQuizIdsArray: number[]) => {
    console.log('[Quiz State]', {
      currentQuizIndex: state.currentQuizIndex,
      currentQuizId: quizIdsArray[state.currentQuizIndex],
      currentQuestionIndex: state.currentQuestionIndex,
      totalQuestions: state.questions?.length || 0,
      currentCategory: categoriesArray[state.currentQuizIndex]?.name,
      totalQuizzes: quizIdsArray.length
    });
  }, []);
  
  // Initialize quiz navigation with the state manager
  const {
    loadQuizData,
    handleNextQuestion,
    saveCurrentQuizResults
  } = useQuizNavigation(user, quizIds, categories, quizStateManager);
  
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
    updateScore,
    // Adding debugging logs for tracking
    logNavigation,
    logCurrentState
  };
};
