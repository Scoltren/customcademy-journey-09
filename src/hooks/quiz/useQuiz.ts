
import { useCallback, useEffect } from 'react';
import { useQuizState } from './useQuizState';
import { useQuizNavigation } from './useQuizNavigation';

export const useQuiz = (user: any, quizIds: number[], categories: any[]) => {
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
    updateScore
  } = quizStateManager;
  
  const {
    loadQuizData,
    handleNextQuestion,
    saveCurrentQuizResults
  } = useQuizNavigation(user, quizIds, categories, quizStateManager);
  
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
