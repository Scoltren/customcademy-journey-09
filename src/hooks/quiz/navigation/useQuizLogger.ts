
import { useCallback } from 'react';

/**
 * Custom hook for logging quiz navigation events
 */
export const useQuizLogger = () => {
  /**
   * Log function to help track quiz navigation
   */
  const logNavigation = useCallback((message: string, data?: any) => {
    // No console.log in production
  }, []);
  
  /**
   * Debug function to log the current state
   */
  const logCurrentState = useCallback((
    quizState: any,
    quizIds: number[],
    categories: any[],
    savedQuizIds: number[]
  ) => {
    // No console.log in production
  }, [logNavigation]);
  
  return {
    logNavigation,
    logCurrentState,
  };
};
