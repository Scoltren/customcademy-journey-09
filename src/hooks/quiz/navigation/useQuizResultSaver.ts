
import { useCallback } from 'react';
import { saveQuizResults } from '../quizResultsService';

/**
 * Custom hook for saving quiz results
 */
export const useQuizResultSaver = (
  logNavigation: (message: string, data?: any) => void
) => {
  /**
   * Save current quiz results
   * @returns boolean indicating success or failure
   */
  const saveCurrentQuizResults = useCallback(async (
    user: any,
    quizIds: number[],
    categories: any[],
    quizState: any,
    savedQuizIds: number[]
  ) => {
    if (!user || !quizIds.length) return false;
    
    const currentQuizId = quizIds[quizState.currentQuizIndex];
    
    // Check if we've already saved this quiz result to prevent duplicates
    if (savedQuizIds.includes(currentQuizId)) {
      logNavigation(`Quiz ${currentQuizId} results already saved, skipping.`);
      return true;
    }
    
    // Get the current category id
    const currentCategoryId = categories[quizState.currentQuizIndex]?.id;
    
    // Save the quiz result - this will delete previous results first
    const success = await saveQuizResults(
      user,
      currentQuizId,
      quizState.score,
      currentCategoryId
    );
    
    return success;
  }, [logNavigation]);
  
  return {
    saveCurrentQuizResults
  };
};
