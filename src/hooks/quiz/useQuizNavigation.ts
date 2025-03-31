
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { saveQuizResults } from './quizResultsService';

export const useQuizNavigation = (
  user: any,
  quizIds: number[],
  categories: any[],
  quizStateManager: any
) => {
  const [savedQuizIds, setSavedQuizIds] = useState<number[]>([]);
  
  const {
    quizState,
    setQuizState,
    setIsLoading,
    setCurrentQuestion,
    setCurrentAnswers,
    setSelectedAnswerIds,
    setCurrentCategory,
    setIsCompleted,
    loadAnswersForQuestion
  } = quizStateManager;
  
  // Load the current quiz questions and first question's answers
  const loadQuizData = useCallback(async () => {
    if (!quizIds.length || quizState.currentQuizIndex >= quizIds.length) {
      setIsCompleted(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentQuizId = quizIds[quizState.currentQuizIndex];
      
      // Set current category
      setCurrentCategory(categories[quizState.currentQuizIndex] || null);
      
      // Fetch questions for the current quiz
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', currentQuizId);
      
      if (questionsError) throw questionsError;
      
      if (!questions || !questions.length) {
        toast.error("No questions available for this quiz");
        // Move to the next quiz if this one has no questions
        setQuizState(prev => ({
          ...prev,
          currentQuizIndex: prev.currentQuizIndex + 1
        }));
        loadQuizData();
        return;
      }
      
      // Set questions and current question
      setQuizState(prev => ({
        ...prev,
        questions: questions,
        currentQuestionIndex: 0
      }));
      
      setCurrentQuestion(questions[0]);
      
      // Load answers for the first question
      await loadAnswersForQuestion(questions[0].id);
      
    } catch (error) {
      console.error("Error loading quiz data:", error);
      toast.error("Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  }, [quizIds, categories, quizState.currentQuizIndex, loadAnswersForQuestion, setCurrentCategory, setCurrentQuestion, setIsCompleted, setIsLoading, setQuizState]);
  
  // Save current quiz results
  const saveCurrentQuizResults = useCallback(async () => {
    if (!user || !quizIds.length) return false;
    
    const currentQuizId = quizIds[quizState.currentQuizIndex];
    
    // Check if we've already saved this quiz result to prevent duplicates
    if (savedQuizIds.includes(currentQuizId)) {
      console.log(`Quiz ${currentQuizId} results already saved, skipping.`);
      return true;
    }
    
    // Get the current category id
    const currentCategoryId = categories[quizState.currentQuizIndex]?.id;
    
    // Save the quiz result
    const success = await saveQuizResults(
      user,
      currentQuizId,
      quizState.score,
      currentCategoryId
    );
    
    if (success) {
      // Mark this quiz as saved to prevent duplicates
      setSavedQuizIds(prev => [...prev, currentQuizId]);
    }
    
    return success;
  }, [user, quizIds, categories, quizState.currentQuizIndex, quizState.score, savedQuizIds]);
  
  // Handle moving to the next question or quiz
  const handleNextQuestion = useCallback(async () => {
    // Check if we need to move to the next question
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      // Move to the next question in the current quiz
      const nextIndex = quizState.currentQuestionIndex + 1;
      const nextQuestion = quizState.questions[nextIndex];
      
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex
      }));
      
      setCurrentQuestion(nextQuestion);
      
      // Load answers for the next question
      await loadAnswersForQuestion(nextQuestion.id);
      
    } else {
      // Current quiz is finished, save results first
      await saveCurrentQuizResults();
      
      // Move to the next quiz
      const nextQuizIndex = quizState.currentQuizIndex + 1;
      
      setQuizState(prev => ({
        ...prev,
        currentQuizIndex: nextQuizIndex,
        currentQuestionIndex: 0,
        questions: [],
        score: 0 // Reset score for the next quiz
      }));
      
      // If there are more quizzes, load the next one
      if (nextQuizIndex < quizIds.length) {
        setIsLoading(true);
        
        // Reset current question and answers
        setCurrentQuestion(null);
        setCurrentAnswers([]);
        setSelectedAnswerIds([]);
        
        // Set a small timeout to allow state updates to propagate
        setTimeout(() => {
          loadQuizData();
        }, 100);
      } else {
        // All quizzes completed
        setIsCompleted(true);
      }
    }
  }, [
    quizState, 
    quizIds, 
    loadQuizData, 
    setCurrentQuestion, 
    setCurrentAnswers, 
    setSelectedAnswerIds, 
    setQuizState, 
    loadAnswersForQuestion, 
    saveCurrentQuizResults, 
    setIsLoading, 
    setIsCompleted
  ]);
  
  return {
    loadQuizData,
    handleNextQuestion,
    saveCurrentQuizResults
  };
};
