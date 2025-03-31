
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
    quizState, 
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
    if (!quizIds.length) {
      console.log("DATA LOADER - No quiz IDs provided");
      setIsCompleted(true);
      return;
    }
    
    // Always use the currentQuizIndex from state - critical for proper quiz progression
    const currentQuizIndex = quizState.currentQuizIndex;
    
    if (currentQuizIndex >= quizIds.length) {
      console.log(`DATA LOADER - Quiz index out of bounds: ${currentQuizIndex} >= ${quizIds.length}`);
      setIsCompleted(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentQuizId = quizIds[currentQuizIndex];
      
      console.log(`DATA LOADER - Loading quiz ${currentQuizIndex + 1}/${quizIds.length}: Quiz ID ${currentQuizId}`);
      console.log(`DATA LOADER - Current quiz state:`, {
        currentQuizIndex: quizState.currentQuizIndex,
        currentQuestionIndex: quizState.currentQuestionIndex,
        totalQuestions: quizState.questions.length
      });
      
      // Set current category
      const currentCategory = categories[currentQuizIndex] || null;
      setCurrentCategory(currentCategory);
      
      // Log what we're about to fetch to help with debugging
      console.log(`DATA LOADER - Fetching questions for quiz ID: ${currentQuizId}, category: ${currentCategory?.name || 'unknown'}`);
      
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
      
      console.log(`DATA LOADER - Fetched questions:`, questions);
      
      if (!questions || !questions.length) {
        toast.error("No questions available for this quiz");
        console.log(`DATA LOADER - No questions found for quiz ID ${currentQuizId}`);
        
        // Try to move to next quiz
        if (currentQuizIndex < quizIds.length - 1) {
          const nextQuizIndex = currentQuizIndex + 1;
          console.log(`DATA LOADER - Moving to next quiz index: ${nextQuizIndex}`);
          
          setQuizState(prev => ({
            ...prev,
            currentQuizIndex: nextQuizIndex,
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
      
      console.log(`DATA LOADER - Loaded ${questions.length} questions for quiz ${currentQuizId}:`, 
        questions.map(q => ({ id: q.id, text: q.question_text?.substring(0, 30) }))
      );
      
      // Set questions and current question
      setQuizState(prev => {
        const updated = {
          ...prev,
          questions: questions,
          currentQuestionIndex: 0,
          score: 0 // Reset score for new quiz
        };
        
        console.log("DATA LOADER - Updated quiz state:", {
          currentQuizIndex: updated.currentQuizIndex,
          questionCount: updated.questions.length,
          sameQuiz: prev.currentQuizIndex === updated.currentQuizIndex,
        });
        
        return updated;
      });
      
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
    quizState, 
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
