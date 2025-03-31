
import { useCallback } from 'react';

// Utility hook for array operations
export const useArrayUtils = () => {
  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = useCallback((array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);
  
  return {
    shuffleArray
  };
};
