
import { useCallback } from 'react';
import { toast } from 'sonner';

// Custom hook for quiz navigation logic
export const useQuizNavigator = (
  quizStateManager: any,
  loadQuizData: (quizIds: number[], categories: any[], savedQuizIds: number[]) => Promise<void>,
  saveCurrentQuizResults: (user: any, quizIds: number[], categories: any[], quizState: any, savedQuizIds: number[]) => Promise<boolean>,
  logNavigation: (message: string, data?: any) => void,
  logCurrentState: (quizState: any, quizIds: number[], categories: any[], savedQuizIds: number[]) => void
) => {
  const {
    quizState,
    setQuizState,
    setCurrentQuestion,
    setCurrentAnswers,
    setSelectedAnswerIds,
    setIsCompleted,
    loadAnswersForQuestion
  } = quizStateManager;
  
  // Handle moving to the next question or quiz
  const handleNextQuestion = useCallback(async (
    user: any,
    quizIds: number[],
    categories: any[],
    savedQuizIds: number[],
    setLoadAttempts: (fn: (prev: number) => number) => void,
    isNavigating: boolean,
    setIsNavigating: (value: boolean) => void
  ) => {
    // Prevent multiple navigation attempts
    if (isNavigating) {
      logNavigation('Navigation already in progress, ignoring request');
      return;
    }
    
    logCurrentState(quizState, quizIds, categories, savedQuizIds);
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
        setSelectedAnswerIds([]);
        
        // Load answers for the next question
        await loadAnswersForQuestion(nextQuestion.id);
        
      } else {
        // Current quiz is finished, save results first (this will delete previous results)
        await saveCurrentQuizResults(user, quizIds, categories, quizState, savedQuizIds);
        
        // Move to the next quiz
        const nextQuizIndex = quizState.currentQuizIndex + 1;
        
        logNavigation(`Current quiz finished. Moving to next quiz index: ${nextQuizIndex}`);
        
        // Check if the next index is valid before proceeding
        if (nextQuizIndex >= quizIds.length) {
          logNavigation(`All quizzes completed. Quiz count: ${quizIds.length}, Next index would be: ${nextQuizIndex}`);
          setIsCompleted(true);
          setIsNavigating(false);
          return;
        }
        
        // Reset current question and answers
        setCurrentQuestion(null);
        setCurrentAnswers([]);
        setSelectedAnswerIds([]);
        
        // Update quiz state with next quiz index
        setQuizState(prev => ({
          ...prev,
          currentQuizIndex: nextQuizIndex,
          currentQuestionIndex: 0,
          questions: [],
          score: 0 // Reset score for the next quiz
        }));
        
        // Give state time to update before loading next quiz
        // Use a small timeout to avoid React state update race conditions
        setTimeout(() => {
          setLoadAttempts(() => 0);
          
          // Log what quiz we're about to load
          const nextQuizId = quizIds[nextQuizIndex];
          const nextCategory = categories[nextQuizIndex];
          logNavigation(`Loading next quiz ID: ${nextQuizId}, Category: ${nextCategory?.name}`);
          
          loadQuizData(quizIds, categories, savedQuizIds)
            .catch(err => {
              logNavigation(`Error loading next quiz: ${err.message}`);
              toast.error("Failed to load next quiz");
            })
            .finally(() => {
              setIsNavigating(false);
            });
        }, 300);
        
        // Return early because loadQuizData will handle setting isNavigating to false
        return;
      }
    } catch (error) {
      console.error("Error in handleNextQuestion:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsNavigating(false);
    }
  }, [
    quizState,
    setQuizState,
    setCurrentQuestion,
    setCurrentAnswers,
    setSelectedAnswerIds,
    setIsCompleted,
    loadAnswersForQuestion,
    loadQuizData,
    saveCurrentQuizResults,
    logNavigation,
    logCurrentState
  ]);
  
  return {
    handleNextQuestion
  };
};
