
import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuizLogger } from './navigation/useQuizLogger';
import { useQuizDataLoader } from './navigation/useQuizDataLoader';
import { useQuizResultSaver } from './navigation/useQuizResultSaver';
import { useQuizNavigator } from './navigation/useQuizNavigator';

export const useQuizNavigation = (
  user: any,
  quizIds: number[],
  categories: any[],
  quizStateManager: any
) => {
  const [savedQuizIds, setSavedQuizIds] = useState<number[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const initialLoadRef = useRef(false);
  
  // Initialize the logger
  const { logNavigation, logCurrentState } = useQuizLogger();
  
  // Initialize the data loader
  const { loadQuizData } = useQuizDataLoader(
    quizStateManager, 
    logNavigation, 
    logCurrentState
  );
  
  // Initialize the results saver
  const { saveCurrentQuizResults } = useQuizResultSaver(logNavigation);
  
  // Initialize the navigator
  const { handleNextQuestion: navigateToNextQuestion } = useQuizNavigator(
    quizStateManager,
    (quizIdsParam, categoriesParam, savedQuizIdsParam) => 
      loadQuizData(quizIdsParam, categoriesParam, savedQuizIdsParam),
    (userParam, quizIdsParam, categoriesParam, quizStateParam, savedQuizIdsParam) => {
      const result = saveCurrentQuizResults(
        userParam, 
        quizIdsParam, 
        categoriesParam, 
        quizStateParam, 
        savedQuizIdsParam
      );
      
      // Update saved quiz IDs if save is successful
      result.then(success => {
        if (success) {
          const currentQuizId = quizIdsParam[quizStateParam.currentQuizIndex];
          setSavedQuizIds(prev => {
            // Only add if it's not already in the array
            if (!prev.includes(currentQuizId)) {
              logNavigation(`Added quiz ${currentQuizId} to savedQuizIds`);
              return [...prev, currentQuizId];
            }
            return prev;
          });
        }
      });
      
      return result;
    },
    logNavigation,
    logCurrentState
  );
  
  // Wrapper for loadQuizData with protection against infinite loops
  const loadQuizDataWrapper = useCallback(() => {
    // Don't load if we're already navigating or completed
    if (isNavigating || quizStateManager.isCompleted) {
      logNavigation("Skipping loadQuizData call - navigation in progress or quiz completed");
      return Promise.resolve();
    }
    
    setIsNavigating(true);
    
    return loadQuizData(quizIds, categories, savedQuizIds)
      .catch(error => {
        // Increment load attempt counter
        setLoadAttempts(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            logNavigation(`Failed to load quiz after ${newCount} attempts, giving up`);
            quizStateManager.setIsCompleted(true);
          }
          return newCount;
        });
      })
      .finally(() => {
        setIsNavigating(false);
      });
  }, [
    isNavigating, 
    quizStateManager.isCompleted, 
    loadQuizData, 
    quizIds, 
    categories, 
    savedQuizIds
  ]);
  
  // Wrapper for handleNextQuestion
  const handleNextQuestionWrapper = useCallback(() => {
    // Don't proceed if we're already navigating
    if (isNavigating) {
      logNavigation("Skipping handleNextQuestion call - navigation already in progress");
      return Promise.resolve();
    }
    
    return navigateToNextQuestion(
      user,
      quizIds,
      categories,
      savedQuizIds,
      setLoadAttempts,
      isNavigating,
      setIsNavigating
    );
  }, [
    navigateToNextQuestion, 
    user, 
    quizIds, 
    categories, 
    savedQuizIds, 
    isNavigating
  ]);
  
  // Wrapper for saveCurrentQuizResults
  const saveCurrentQuizResultsWrapper = useCallback(() => {
    // Don't save if we're already saving or completed
    if (isNavigating) {
      logNavigation("Skipping saveQuizResults call - navigation in progress");
      return Promise.resolve(false);
    }
    
    return saveCurrentQuizResults(
      user, 
      quizIds, 
      categories, 
      quizStateManager.quizState, 
      savedQuizIds
    ).then(success => {
      if (success) {
        // Mark this quiz as saved to prevent duplicates
        const currentQuizId = quizIds[quizStateManager.quizState.currentQuizIndex];
        setSavedQuizIds(prev => {
          if (!prev.includes(currentQuizId)) {
            return [...prev, currentQuizId];
          }
          return prev;
        });
      }
      return success;
    });
  }, [
    isNavigating,
    user, 
    quizIds, 
    categories, 
    quizStateManager.quizState, 
    savedQuizIds, 
    saveCurrentQuizResults
  ]);
  
  // Single effect to handle initial quiz loading - prevents multiple loading attempts
  useEffect(() => {
    if (quizIds.length > 0 && !initialLoadRef.current && !quizStateManager.isCompleted) {
      initialLoadRef.current = true;
      logNavigation("Initial quiz load triggered");
      loadQuizDataWrapper();
    }
  }, [quizIds, quizStateManager.isCompleted, loadQuizDataWrapper]);
  
  return {
    loadQuizData: loadQuizDataWrapper,
    handleNextQuestion: handleNextQuestionWrapper,
    saveCurrentQuizResults: saveCurrentQuizResultsWrapper
  };
};
