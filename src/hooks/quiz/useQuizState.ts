
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuizState {
  currentQuizIndex: number;
  currentQuestionIndex: number;
  questions: any[];
  score: number;
}

export const useQuizState = (quizIds: number[]) => {
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
  
  // Load the answers for a specific question
  const loadAnswersForQuestion = useCallback(async (questionId: number) => {
    try {
      const { data: answers, error } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', questionId);
      
      if (error) throw error;
      setCurrentAnswers(answers || []);
      setSelectedAnswerIds([]);
      
      return answers;
    } catch (error) {
      console.error("Error loading answers:", error);
      toast.error("Failed to load question answers");
      return [];
    }
  }, []);
  
  // Handle selecting an answer
  const handleSelectAnswer = useCallback((answerId: number) => {
    setSelectedAnswerIds(prev => {
      // Toggle the selected answer
      return prev.includes(answerId)
        ? prev.filter(id => id !== answerId)
        : [...prev, answerId];
    });
  }, []);
  
  // Update quiz score
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
    currentAnswers,
    setCurrentAnswers,
    selectedAnswerIds,
    setSelectedAnswerIds,
    currentCategory,
    setCurrentCategory,
    isCompleted,
    setIsCompleted,
    loadAnswersForQuestion,
    handleSelectAnswer,
    updateScore
  };
};
