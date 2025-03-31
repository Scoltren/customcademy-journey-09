
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
  
  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = useCallback((array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);
  
  // Load the answers for a specific question
  const loadAnswersForQuestion = useCallback(async (questionId: number) => {
    try {
      console.log(`Loading answers for question ID ${questionId}`);
      
      const { data: answers, error } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', questionId);
      
      if (error) throw error;
      
      // Randomize the order of answers before setting them
      const randomizedAnswers = answers ? shuffleArray(answers) : [];
      
      setCurrentAnswers(randomizedAnswers);
      setSelectedAnswerIds([]);
      
      console.log(`Loaded ${randomizedAnswers.length || 0} answers for question ID ${questionId}`);
      
      return answers;
    } catch (error) {
      console.error("Error loading answers:", error);
      toast.error("Failed to load question answers");
      return [];
    }
  }, [shuffleArray]);
  
  // Handle selecting an answer
  const handleSelectAnswer = useCallback((answerId: number) => {
    setSelectedAnswerIds(prev => {
      // Toggle the selected answer
      const updated = prev.includes(answerId)
        ? prev.filter(id => id !== answerId)
        : [...prev, answerId];
        
      console.log(`Selected answer IDs updated: ${updated.join(', ') || 'none'}`);
      
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
    loadAnswersForQuestion,
    handleSelectAnswer,
    updateScore
  };
};
