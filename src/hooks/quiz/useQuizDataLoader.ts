
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
}

export const useQuizDataLoader = (stateManager: QuizStateManager) => {
  const {
    quizState, 
    setQuizState, 
    setIsLoading, 
    setCurrentQuestion, 
    setCurrentCategory, 
    setIsCompleted,
    loadAnswersForQuestion,
    setSelectedAnswerIds
  } = stateManager;

  // Load the current quiz questions and first question's answers
  const loadQuizData = useCallback(async (quizIds: number[], categories: any[]) => {
    if (!quizIds.length) {
      console.log("No quiz IDs provided");
      setIsCompleted(true);
      return;
    }
    
    const currentQuizIndex = quizState.currentQuizIndex;
    
    if (currentQuizIndex >= quizIds.length) {
      console.log(`Quiz index out of bounds: ${currentQuizIndex} >= ${quizIds.length}`);
      setIsCompleted(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentQuizId = quizIds[currentQuizIndex];
      
      console.log(`Loading quiz ${currentQuizIndex + 1}/${quizIds.length}: Quiz ID ${currentQuizId}`);
      console.log(`Current quiz state:`, {
        currentQuizIndex: quizState.currentQuizIndex,
        currentQuestionIndex: quizState.currentQuestionIndex,
        totalQuestions: quizState.questions.length
      });
      
      // Set current category
      const currentCategory = categories[currentQuizIndex] || null;
      setCurrentCategory(currentCategory);
      
      // Log what we're about to fetch to help with debugging
      console.log(`Fetching questions for quiz ID: ${currentQuizId}, category: ${currentCategory?.name || 'unknown'}`);
      
      // Fetch questions for the current quiz
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', currentQuizId);
      
      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        throw questionsError;
      }
      
      if (!questions || !questions.length) {
        toast.error("No questions available for this quiz");
        console.log(`No questions found for quiz ID ${currentQuizId}`);
        
        // Try to move to next quiz
        if (currentQuizIndex < quizIds.length - 1) {
          setQuizState(prev => ({
            ...prev,
            currentQuizIndex: prev.currentQuizIndex + 1,
            currentQuestionIndex: 0,
            questions: [],
            score: 0
          }));
          
          setIsLoading(false);
          // The next useEffect will trigger loading the next quiz
          return;
        } else {
          setIsCompleted(true);
          setIsLoading(false);
          return;
        }
      }
      
      console.log(`Loaded ${questions.length} questions for quiz ${currentQuizId}:`, 
        questions.map(q => ({ id: q.id, text: q.question_text?.substring(0, 30) }))
      );
      
      // Set questions and current question
      setQuizState(prev => ({
        ...prev,
        questions: questions,
        currentQuestionIndex: 0,
        score: 0 // Reset score for new quiz
      }));
      
      setCurrentQuestion(questions[0]);
      setSelectedAnswerIds([]);
      
      // Load answers for the first question
      await loadAnswersForQuestion(questions[0].id);
      
    } catch (error) {
      console.error("Error loading quiz data:", error);
      toast.error("Failed to load quiz");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [
    quizState, 
    setQuizState, 
    setIsLoading, 
    setCurrentQuestion, 
    setCurrentCategory, 
    setIsCompleted, 
    loadAnswersForQuestion, 
    setSelectedAnswerIds
  ]);

  return {
    loadQuizData
  };
};
