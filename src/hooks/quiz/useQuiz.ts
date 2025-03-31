
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuizState } from './useQuizState';
import { useCurrentAnswers } from './answers/useCurrentAnswers';
import { useQuizResults } from './useQuizResults';
import { useQuizDataLoader } from './useQuizDataLoader';
import { useQuizNavigation } from './useQuizNavigation';

export const useQuiz = (user: any, initialQuizIds: number[], initialCategories: any[]) => {
  // Track initial load
  const initialLoadRef = useRef(false);
  
  // Create state to manage the dynamic quiz and category arrays
  const [quizIds, setQuizIds] = useState<number[]>(initialQuizIds);
  const [categories, setCategories] = useState<any[]>(initialCategories);
  
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
      
      // Reset state for a fresh start
      setQuizState({
        currentQuizIndex: 0,
        currentQuestionIndex: 0,
        questions: [],
        score: 0
      });
      
      // Load quiz data with a slight delay to ensure state is set
      setTimeout(() => {
        console.log("Loading initial quiz data with quizIds:", quizIds);
        loadQuizData(quizIds, categories);
      }, 100);
    }
  }, [quizIds, categories, isCompleted, loadQuizData, setQuizState]);
  
  // Reset initial load ref when we receive new quiz IDs
  useEffect(() => {
    if (initialQuizIds.length > 0) {
      // Update our quiz state with new quiz IDs
      setQuizIds(initialQuizIds);
      setCategories(initialCategories);
      
      // Reset the load state
      initialLoadRef.current = false;
      
      // Reset completion state
      setIsCompleted(false);
      
      // Reset quiz state to start from the beginning
      setQuizState({
        currentQuizIndex: 0,
        currentQuestionIndex: 0,
        questions: [],
        score: 0
      });
      
      console.log("Quiz IDs updated from props:", { 
        initialQuizIds: initialQuizIds.map(id => id),
        initialLoadRef: initialLoadRef.current
      });
    }
  }, [initialQuizIds, initialCategories, setIsCompleted, setQuizState]);
  
  // Create a wrapped next question handler
  const handleNextQuestionWrapper = useCallback(() => {
    // After handling the next question, the quizIds array will be updated
    handleNextQuestion(user, quizIds, categories).then(() => {
      // If moving to the next quiz, update our local arrays
      if (quizState.currentQuestionIndex === quizState.questions.length - 1) {
        // Remove the completed quiz from the local arrays
        setQuizIds(prev => prev.slice(1));
        setCategories(prev => prev.slice(1));
        
        console.log("Updated quiz IDs after navigation:", {
          newQuizIds: quizIds.slice(1).map(id => id)
        });
      }
    });
  }, [handleNextQuestion, user, quizIds, categories, quizState, setQuizIds, setCategories]);
  
  // Create a wrapped save results function
  const saveQuizResultsWrapper = useCallback(async () => {
    if (quizIds.length === 0) {
      console.error("Cannot save results - no quizzes available");
      return false;
    }
    
    const currentQuizId = quizIds[0]; // Always use the first quiz in the array
    const currentCategoryId = categories[0]?.id;
    
    return await saveQuizResults(
      currentQuizId,
      quizState.score,
      currentCategoryId
    );
  }, [saveQuizResults, quizIds, categories, quizState.score]);
  
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
