
import { useState, useCallback, useEffect } from 'react';
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
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  
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
  
  // Log function to help track quiz navigation
  const logNavigation = useCallback((message: string, data?: any) => {
    console.log(`[QuizNavigation] ${message}`, data ? data : '');
  }, []);
  
  // Debug function to log the current state
  const logCurrentState = useCallback(() => {
    logNavigation('Current State:', {
      quizIds,
      currentQuizIndex: quizState.currentQuizIndex,
      currentQuizId: quizIds[quizState.currentQuizIndex],
      currentCategory: categories[quizState.currentQuizIndex]?.name,
      currentQuestionIndex: quizState.currentQuestionIndex,
      totalQuestions: quizState.questions.length,
      savedQuizIds
    });
  }, [quizState, quizIds, categories, savedQuizIds, logNavigation]);
  
  // Load the current quiz questions and first question's answers
  const loadQuizData = useCallback(async () => {
    if (!quizIds.length) {
      logNavigation('No quiz IDs provided');
      setIsCompleted(true);
      return;
    }
    
    if (quizState.currentQuizIndex >= quizIds.length) {
      logNavigation(`Quiz index out of bounds: ${quizState.currentQuizIndex} >= ${quizIds.length}`);
      setIsCompleted(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentQuizId = quizIds[quizState.currentQuizIndex];
      
      logNavigation(`Loading quiz ${quizState.currentQuizIndex + 1}/${quizIds.length}: Quiz ID ${currentQuizId}`);
      
      // Set current category
      const currentCategory = categories[quizState.currentQuizIndex] || null;
      setCurrentCategory(currentCategory);
      logNavigation(`Current category set to:`, currentCategory);
      
      // Fetch questions for the current quiz
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', currentQuizId);
      
      if (questionsError) throw questionsError;
      
      if (!questions || !questions.length) {
        toast.error("No questions available for this quiz");
        logNavigation(`No questions found for quiz ${currentQuizId}, moving to next quiz`);
        
        // Instead of recursively calling loadQuizData, let's update state and let React effect handle it
        if (quizState.currentQuizIndex < quizIds.length - 1) {
          setQuizState(prev => ({
            ...prev,
            currentQuizIndex: prev.currentQuizIndex + 1
          }));
        } else {
          setIsCompleted(true);
        }
        setIsLoading(false);
        return;
      }
      
      logNavigation(`Loaded ${questions.length} questions for quiz ${currentQuizId}`);
      
      // Set questions and current question
      setQuizState(prev => ({
        ...prev,
        questions: questions,
        currentQuestionIndex: 0,
        score: 0 // Reset score for new quiz
      }));
      
      setCurrentQuestion(questions[0]);
      
      // Load answers for the first question
      await loadAnswersForQuestion(questions[0].id);
      
      logCurrentState();
      
    } catch (error) {
      console.error("Error loading quiz data:", error);
      toast.error("Failed to load quiz");
      
      // Increment load attempt counter
      setLoadAttempts(prev => prev + 1);
      
      // If we've tried more than 3 times, give up and complete the quiz
      if (loadAttempts >= 3) {
        setIsCompleted(true);
        toast.error("Unable to load quiz after multiple attempts");
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    quizIds, 
    categories, 
    quizState.currentQuizIndex, 
    loadAnswersForQuestion, 
    setCurrentCategory, 
    setCurrentQuestion, 
    setIsCompleted, 
    setIsLoading, 
    setQuizState, 
    logNavigation, 
    logCurrentState,
    loadAttempts
  ]);
  
  // Save current quiz results
  const saveCurrentQuizResults = useCallback(async () => {
    if (!user || !quizIds.length) return false;
    
    const currentQuizId = quizIds[quizState.currentQuizIndex];
    
    // Check if we've already saved this quiz result to prevent duplicates
    if (savedQuizIds.includes(currentQuizId)) {
      logNavigation(`Quiz ${currentQuizId} results already saved, skipping.`);
      return true;
    }
    
    // Get the current category id
    const currentCategoryId = categories[quizState.currentQuizIndex]?.id;
    
    logNavigation(`Saving results for quiz ${currentQuizId}, category ${currentCategoryId}, score ${quizState.score}`);
    
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
      logNavigation(`Saved quiz ${currentQuizId} to savedQuizIds: [${[...savedQuizIds, currentQuizId].join(', ')}]`);
    } else {
      logNavigation(`Failed to save quiz ${currentQuizId} results`);
    }
    
    return success;
  }, [user, quizIds, categories, quizState.currentQuizIndex, quizState.score, savedQuizIds, logNavigation]);
  
  // Handle moving to the next question or quiz
  const handleNextQuestion = useCallback(async () => {
    // Prevent multiple navigation attempts
    if (isNavigating) {
      logNavigation('Navigation already in progress, ignoring request');
      return;
    }
    
    logCurrentState();
    setIsNavigating(true);
    
    try {
      // Check if we need to move to the next question
      if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
        // Move to the next question in the current quiz
        const nextIndex = quizState.currentQuestionIndex + 1;
        const nextQuestion = quizState.questions[nextIndex];
        
        logNavigation(`Moving to next question: ${nextIndex + 1}/${quizState.questions.length}`);
        
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
        
        logNavigation(`Current quiz finished. Moving to next quiz index: ${nextQuizIndex}`);
        
        // Reset current question and answers
        setCurrentQuestion(null);
        setCurrentAnswers([]);
        setSelectedAnswerIds([]);
        
        // Check if the next index is valid before proceeding
        if (nextQuizIndex >= quizIds.length) {
          logNavigation(`All quizzes completed. Quiz count: ${quizIds.length}, Next index would be: ${nextQuizIndex}`);
          setIsCompleted(true);
          return;
        }
        
        // Update quiz state with next quiz index
        setQuizState(prev => ({
          ...prev,
          currentQuizIndex: nextQuizIndex,
          currentQuestionIndex: 0,
          questions: [],
          score: 0 // Reset score for the next quiz
        }));
        
        // Give state time to update before loading next quiz
        setTimeout(() => {
          setLoadAttempts(0); // Reset load attempts for the new quiz
          loadQuizData();
        }, 300);
      }
    } catch (error) {
      console.error("Error in handleNextQuestion:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsNavigating(false);
    }
  }, [
    isNavigating,
    quizState, 
    quizIds, 
    loadQuizData, 
    setCurrentQuestion, 
    setCurrentAnswers, 
    setSelectedAnswerIds, 
    setQuizState, 
    loadAnswersForQuestion, 
    saveCurrentQuizResults, 
    setIsCompleted,
    logNavigation,
    logCurrentState
  ]);
  
  // Add effect to handle quiz loading and retry logic
  useEffect(() => {
    // Don't attempt to load if already completed
    if (isCompleted) return;
    
    // Reset load attempts when quiz index changes
    if (quizState.currentQuizIndex !== quizIds.indexOf(quizState.currentQuizIndex)) {
      setLoadAttempts(0);
    }
  }, [quizState.currentQuizIndex, quizIds, isCompleted]);
  
  return {
    loadQuizData,
    handleNextQuestion,
    saveCurrentQuizResults
  };
};
