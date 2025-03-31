
import { useCallback } from 'react';
import { saveQuizResults } from '../quizResultsService';

// Custom hook for saving quiz results
export const useQuizResultSaver = (
  logNavigation: (message: string, data?: any) => void
) => {
  // Save current quiz results
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
    
    logNavigation(`Saving results for quiz ${currentQuizId}, category ${currentCategoryId}, score ${quizState.score}`);
    
    // Save the quiz result
    const success = await saveQuizResults(
      user,
      currentQuizId,
      quizState.score,
      currentCategoryId
    );
    
    if (success) {
      logNavigation(`Successfully saved quiz ${currentQuizId} results`);
    } else {
      logNavigation(`Failed to save quiz ${currentQuizId} results`);
    }
    
    return success;
  }, [logNavigation]);
  
  return {
    saveCurrentQuizResults
  };
};
