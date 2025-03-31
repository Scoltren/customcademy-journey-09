
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
    updateScore
  };
};
