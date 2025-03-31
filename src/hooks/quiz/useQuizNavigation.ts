
import { useState, useCallback, useEffect } from 'react';
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
          setSavedQuizIds(prev => [...prev, currentQuizId]);
          logNavigation(`Added quiz ${currentQuizId} to savedQuizIds: [${[...savedQuizIds, currentQuizId].join(', ')}]`);
        }
      });
      
      return result;
    },
    logNavigation,
    logCurrentState
  );
  
  // Wrapper for loadQuizData
  const loadQuizDataWrapper = useCallback(async () => {
    try {
      await loadQuizData(quizIds, categories, savedQuizIds);
    } catch (error) {
      // Increment load attempt counter
      setLoadAttempts(prev => prev + 1);
      
      // If we've tried more than 3 times, give up
      if (loadAttempts >= 3) {
        quizStateManager.setIsCompleted(true);
        logNavigation(`Failed to load quiz after ${loadAttempts} attempts, giving up`);
      }
    }
  }, [loadQuizData, quizIds, categories, savedQuizIds, loadAttempts, quizStateManager]);
  
  // Wrapper for handleNextQuestion
  const handleNextQuestionWrapper = useCallback(async () => {
    await navigateToNextQuestion(
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
  const saveCurrentQuizResultsWrapper = useCallback(async () => {
    const success = await saveCurrentQuizResults(
      user, 
      quizIds, 
      categories, 
      quizStateManager.quizState, 
      savedQuizIds
    );
    
    if (success) {
      // Mark this quiz as saved to prevent duplicates
      const currentQuizId = quizIds[quizStateManager.quizState.currentQuizIndex];
      setSavedQuizIds(prev => [...prev, currentQuizId]);
      logNavigation(`Saved quiz ${currentQuizId} to savedQuizIds: [${[...savedQuizIds, currentQuizId].join(', ')}]`);
    }
    
    return success;
  }, [user, quizIds, categories, quizStateManager.quizState, savedQuizIds, saveCurrentQuizResults]);
  
  // Add effect to handle quiz loading and retry logic
  useEffect(() => {
    // Don't attempt to load if already completed
    const isQuizCompleted = false; // This is a local variable, not a state

    if (isQuizCompleted) return;
    
    // Reset load attempts when quiz index changes
    if (quizStateManager.quizState.currentQuizIndex !== quizIds.indexOf(quizStateManager.quizState.currentQuizIndex)) {
      setLoadAttempts(0);
    }
  }, [quizStateManager.quizState.currentQuizIndex, quizIds]);
  
  return {
    loadQuizData: loadQuizDataWrapper,
    handleNextQuestion: handleNextQuestionWrapper,
    saveCurrentQuizResults: saveCurrentQuizResultsWrapper
  };
};
