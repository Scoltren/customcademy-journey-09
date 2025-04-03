
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QuizState } from './useQuizState';

export interface QuizStateManager {
  quizState: QuizState;
  setQuizState: (state: QuizState | ((prev: QuizState) => QuizState)) => void;
  setIsLoading: (isLoading: boolean) => void;
  setCurrentQuestion: (question: any) => void;
  setCurrentCategory: (category: any) => void;
  setIsCompleted: (isCompleted: boolean) => void;
  loadAnswersForQuestion: (questionId: number) => Promise<any>;
  setSelectedAnswerIds: (ids: number[]) => void;
  setCurrentAnswers: (answers: any[]) => void;
}

export const useQuizDataLoader = (stateManager: QuizStateManager) => {
  const {
    setQuizState, 
    setIsLoading, 
    setCurrentQuestion, 
    setCurrentCategory, 
    setIsCompleted,
    loadAnswersForQuestion,
    setSelectedAnswerIds,
    setCurrentAnswers
  } = stateManager;

  // Load the current quiz questions and first question's answers
  const loadQuizData = useCallback(async (quizIds: number[], categories: any[]) => {
    // Check if we have any quizzes left
    if (!quizIds || !quizIds.length) {
      console.log("DATA LOADER - No quiz IDs provided, completing quiz");
      setIsCompleted(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Always use the first quiz in the array
      const currentQuizId = quizIds[0];
      
      console.log(`DATA LOADER - Loading quiz: Quiz ID ${currentQuizId}`);
      console.log(`DATA LOADER - Available quiz IDs: ${JSON.stringify(quizIds)}`);
      
      // Set current category to match the current quiz
      const currentCategory = categories[0] || null;
      setCurrentCategory(currentCategory);
      console.log(`DATA LOADER - Set current category to:`, currentCategory);
      
      // Fetch questions for the current quiz
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', currentQuizId)
        .order('id');
      
      if (questionsError) {
        console.error("DATA LOADER - Error fetching questions:", questionsError);
        throw questionsError;
      }
      
      if (!questions || !questions.length) {
        toast.error("No questions available for this quiz");
        console.log(`DATA LOADER - No questions found for quiz ID ${currentQuizId}`);
        
        // Remove the current quiz and try the next quiz if available
        const remainingQuizIds = [...quizIds.slice(1)];
        const remainingCategories = [...categories.slice(1)];
        
        if (remainingQuizIds.length === 0) {
          console.log("DATA LOADER - No remaining quizzes, completing");
          setIsCompleted(true);
          setIsLoading(false);
          return;
        }
        
        // Try to load the next quiz with a small delay
        setTimeout(() => {
          loadQuizData(remainingQuizIds, remainingCategories);
        }, 300);
        
        return;
      }
      
      console.log(`DATA LOADER - Loaded ${questions.length} questions for quiz ${currentQuizId}`);
      
      // Update quiz state with questions and reset the question index
      setQuizState(prev => ({
        ...prev,
        questions: questions,
        currentQuestionIndex: 0,
        score: 0 // Reset score for new quiz
      }));
      
      console.log(`DATA LOADER - Setting current question to:`, questions[0]);
      setCurrentQuestion(questions[0]);
      setSelectedAnswerIds([]);
      setCurrentAnswers([]);
      
      // Load answers for the first question
      await loadAnswersForQuestion(questions[0].id);
      
    } catch (error) {
      console.error("DATA LOADER - Error loading quiz data:", error);
      toast.error("Failed to load quiz");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [
    setQuizState, 
    setIsLoading, 
    setCurrentQuestion, 
    setCurrentCategory, 
    setIsCompleted, 
    loadAnswersForQuestion, 
    setSelectedAnswerIds,
    setCurrentAnswers
  ]);

  return {
    loadQuizData
  };
};
