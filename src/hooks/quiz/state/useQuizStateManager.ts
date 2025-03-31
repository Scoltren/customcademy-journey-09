
import { useState, useCallback } from 'react';

// Define types for quiz state
export interface QuizState {
  currentQuizIndex: number;
  currentQuestionIndex: number;
  questions: any[];
  score: number;
}

// Primary hook for quiz state management
export const useQuizStateManager = (quizIds: number[]) => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuizIndex: 0,
    currentQuestionIndex: 0,
    questions: [],
    score: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [currentAnswers, setCurrentAnswers] = useState<any[]>([]);
  const [selectedAnswerIds, setSelectedAnswerIds] = useState<number[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Custom state setter with enhanced logging
  const updateQuizState = useCallback((newState: QuizState | ((prev: QuizState) => QuizState)) => {
    setQuizState(prev => {
      const updated = typeof newState === 'function' ? newState(prev) : newState;
      
      console.log('QuizState updated:', {
        currentQuizIndex: `${prev.currentQuizIndex} → ${updated.currentQuizIndex}`,
        currentQuestionIndex: `${prev.currentQuestionIndex} → ${updated.currentQuestionIndex}`,
        totalQuestions: prev.questions.length !== updated.questions.length ? 
          `${prev.questions.length} → ${updated.questions.length}` : updated.questions.length,
        score: `${prev.score} → ${updated.score}`
      });
      
      return updated;
    });
  }, []);
  
  // Update quiz score
  const updateScore = useCallback((additionalPoints: number) => {
    setQuizState(prev => {
      const updated = {
        ...prev,
        score: prev.score + additionalPoints
      };
      
      console.log(`Score updated: ${prev.score} → ${updated.score} (+${additionalPoints})`);
      
      return updated;
    });
  }, []);
  
  return {
    quizState,
    setQuizState: updateQuizState,
    isLoading,
    setIsLoading,
    currentQuestion,
    setCurrentQuestion,
    currentAnswers,
    setCurrentAnswers,
    selectedAnswerIds,
    setSelectedAnswerIds,
    currentCategory,
    setCurrentCategory,
    isCompleted,
    setIsCompleted,
    updateScore
  };
};
