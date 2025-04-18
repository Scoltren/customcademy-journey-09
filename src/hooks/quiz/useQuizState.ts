
import { useState, useCallback } from 'react';

export interface QuizState {
  currentQuizIndex: number;
  currentQuestionIndex: number;
  questions: any[];
  score: number;
}

/**
 * Custom hook to manage quiz state
 */
export const useQuizState = () => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuizIndex: 0,
    currentQuestionIndex: 0,
    questions: [],
    score: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  
  /**
   * Update quiz score
   * @param additionalPoints Points to add to current score
   */
  const updateScore = useCallback((additionalPoints: number) => {
    setQuizState(prev => ({
      ...prev,
      score: prev.score + additionalPoints
    }));
  }, []);

  return {
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
  };
};
