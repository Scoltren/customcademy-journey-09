
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
  
  // Load quiz data on first render or when quizIds change
  useEffect(() => {
    if (quizIds.length > 0 && !initialLoadRef.current && !isCompleted) {
      initialLoadRef.current = true;
      console.log("Initial quiz load triggered", {
        quizIds: quizIds.map(id => id),
        categories: categories.map(c => c?.name || 'unknown'),
        initialLoadRef: initialLoadRef.current
      });
      
      // Reset to first quiz index when initially loading
      setQuizState(prev => ({
        ...prev,
        currentQuizIndex: 0,
        currentQuestionIndex: 0,
        questions: [],
        score: 0
      }));
      
      // Load quiz data with a slight delay to ensure state is set
      setTimeout(() => {
        console.log("Loading initial quiz data with quizIds:", quizIds);
        loadQuizData(quizIds, categories);
      }, 100);
    }
  }, [quizIds, categories, isCompleted, loadQuizData, setQuizState]);
  
  // Reset initial load ref when quiz IDs change to force reload
  useEffect(() => {
    // Only reset if we have new quiz IDs and they're different from before
    if (quizIds.length > 0) {
      initialLoadRef.current = false;
      
      // Reset completion state when quiz IDs change
      setIsCompleted(false);
      
      // Reset quiz state to start from the beginning
      setQuizState(prev => ({
        ...prev,
        currentQuizIndex: 0,
        currentQuestionIndex: 0,
        questions: [],
        score: 0
      }));
      
      console.log("Quiz IDs changed, reset load state", { 
        quizIds: quizIds.map(id => id),
        initialLoadRef: initialLoadRef.current
      });
    }
  }, [quizIds, setIsCompleted, setQuizState]);
  
  // Create a wrapped next question handler
  const handleNextQuestionWrapper = useCallback(() => {
    return handleNextQuestion(user, quizIds, categories);
  }, [handleNextQuestion, user, quizIds, categories]);
  
  // Create a wrapped save results function
  const saveQuizResultsWrapper = useCallback(async () => {
    if (quizState.currentQuizIndex >= quizIds.length) {
      console.error("Cannot save results - quiz index out of bounds");
      return false;
    }
    
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
      isLoading,
      initialLoadRef: initialLoadRef.current
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
