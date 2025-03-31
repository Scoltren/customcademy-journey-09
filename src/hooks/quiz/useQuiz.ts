
import { useCallback, useEffect, useRef } from 'react';
import { useQuizState } from './useQuizState';
import { useCurrentAnswers } from './answers/useCurrentAnswers';
import { useQuizResults } from './useQuizResults';
import { useQuizDataLoader } from './useQuizDataLoader';
import { useQuizNavigation } from './useQuizNavigation';

export const useQuiz = (user: any, quizIds: number[], categories: any[]) => {
  // Track initial load
  const initialLoadRef = useRef(false);
  
  // Initialize quiz state
  const {
    quizState,
    setQuizState,
    isLoading,
    setIsLoading,
    currentQuestion,
    setCurrentQuestion,
    currentCategory,
    setCurrentCategory,
    isCompleted,
    setIsCompleted,
    updateScore
  } = useQuizState();
  
  // Initialize answers state
  const {
    currentAnswers,
    setCurrentAnswers,
    selectedAnswerIds,
    setSelectedAnswerIds,
    handleSelectAnswer,
    loadAnswersForQuestion
  } = useCurrentAnswers();
  
  // Create state manager for passing to other hooks
  const stateManager = {
    quizState,
    setQuizState,
    setIsLoading,
    setCurrentQuestion,
    setCurrentCategory,
    setIsCompleted,
    loadAnswersForQuestion,
    setSelectedAnswerIds,
    setCurrentAnswers
  };
  
  // Initialize quiz results
  const { saveQuizResults } = useQuizResults(user);
  
  // Initialize quiz data loader
  const { loadQuizData } = useQuizDataLoader(stateManager);
  
  // Initialize quiz navigation
  const { handleNextQuestion } = useQuizNavigation(
    stateManager,
    loadQuizData,
    saveQuizResults
  );
  
  // Load quiz data on first render
  useEffect(() => {
    if (quizIds.length > 0 && !initialLoadRef.current && !isCompleted) {
      initialLoadRef.current = true;
      console.log("Initial quiz load triggered", {
        quizIds: quizIds.map(id => id),
        categories: categories.map(c => c?.name || 'unknown')
      });
      loadQuizData(quizIds, categories);
    }
  }, [quizIds, categories, isCompleted, loadQuizData]);
  
  // Create a wrapped next question handler
  const handleNextQuestionWrapper = useCallback(() => {
    return handleNextQuestion(user, quizIds, categories);
  }, [handleNextQuestion, user, quizIds, categories]);
  
  // Create a wrapped save results function
  const saveQuizResultsWrapper = useCallback(async () => {
    const currentQuizId = quizIds[quizState.currentQuizIndex];
    const currentCategoryId = categories[quizState.currentQuizIndex]?.id;
    
    return await saveQuizResults(
      currentQuizId,
      quizState.score,
      currentCategoryId
    );
  }, [saveQuizResults, quizIds, categories, quizState]);
  
  // Debug logging
  const logQuizState = useCallback(() => {
    console.log("Current Quiz State:", {
      quizIds: quizIds.map(id => id),
      categories: categories.map(c => c?.name || 'unknown'),
      currentQuizIndex: quizState.currentQuizIndex,
      currentQuestionIndex: quizState.currentQuestionIndex,
      score: quizState.score,
      totalQuestions: quizState.questions.length,
      isCompleted,
      isLoading
    });
  }, [quizState, quizIds, categories, isCompleted, isLoading]);

  return {
    quizState,
    isLoading,
    currentCategory,
    currentQuestion,
    currentAnswers,
    selectedAnswerIds,
    handleSelectAnswer,
    handleNextQuestion: handleNextQuestionWrapper,
    saveQuizResults: saveQuizResultsWrapper,
    isCompleted,
    updateScore,
    logQuizState
  };
};
