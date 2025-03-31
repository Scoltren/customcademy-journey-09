
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useQuizNavigation = (
  stateManager: any,
  loadQuizData: (quizIds: number[], categories: any[]) => Promise<void>,
  saveQuizResults: (quizId: number, score: number, categoryId?: number) => Promise<boolean>
) => {
  const {
    quizState,
    setQuizState,
    setCurrentQuestion,
    setCurrentAnswers,
    setSelectedAnswerIds,
    setIsCompleted,
    loadAnswersForQuestion
  } = stateManager;

  // Handle moving to the next question or quiz
  const handleNextQuestion = useCallback(async (user: any, quizIds: number[], categories: any[]) => {
    console.log("Current state before navigation:", {
      currentQuizIndex: quizState.currentQuizIndex,
      currentQuestionIndex: quizState.currentQuestionIndex,
      totalQuestions: quizState.questions.length,
      totalQuizzes: quizIds.length
    });
    
    try {
      // Check if we need to move to the next question
      if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
        // Move to the next question in the current quiz
        const nextIndex = quizState.currentQuestionIndex + 1;
        const nextQuestion = quizState.questions[nextIndex];
        
        console.log(`Moving to next question: ${nextIndex + 1}/${quizState.questions.length}`);
        
        setQuizState(prev => ({
          ...prev,
          currentQuestionIndex: nextIndex
        }));
        
        setCurrentQuestion(nextQuestion);
        setSelectedAnswerIds([]);
        
        // Load answers for the next question
        await loadAnswersForQuestion(nextQuestion.id);
        
      } else {
        // Current quiz is finished, save results first
        const currentQuizId = quizIds[quizState.currentQuizIndex];
        const currentCategory = categories[quizState.currentQuizIndex];
        
        await saveQuizResults(
          currentQuizId, 
          quizState.score, 
          currentCategory?.id
        );
        
        // Move to the next quiz
        const nextQuizIndex = quizState.currentQuizIndex + 1;
        
        console.log(`Current quiz finished. Moving to next quiz index: ${nextQuizIndex}`);
        
        // Check if there are more quizzes
        if (nextQuizIndex >= quizIds.length) {
          console.log("All quizzes completed");
          setIsCompleted(true);
          return;
        }
        
        // Reset state for the next quiz
        setCurrentQuestion(null);
        setCurrentAnswers([]);
        setSelectedAnswerIds([]);
        
        // Important: Make sure to update the quiz index BEFORE loading data for the next quiz
        const updatedQuizState = {
          ...quizState,
          currentQuizIndex: nextQuizIndex,
          currentQuestionIndex: 0,
          questions: [],
          score: 0 // Reset score for the next quiz
        };
        
        setQuizState(updatedQuizState);
        
        console.log("Updated quiz state:", {
          nextQuizIndex,
          updatedState: updatedQuizState
        });
        
        // Load the next quiz data with a slight delay to allow state to update
        setTimeout(() => {
          loadQuizData(quizIds, categories)
            .catch(error => {
              console.error("Error loading next quiz:", error);
              toast.error("Failed to load next quiz");
            });
        }, 300);
      }
    } catch (error) {
      console.error("Error in handleNextQuestion:", error);
      toast.error("An error occurred. Please try again.");
    }
  }, [
    quizState,
    setQuizState,
    setCurrentQuestion,
    setCurrentAnswers,
    setSelectedAnswerIds,
    setIsCompleted,
    loadAnswersForQuestion,
    saveQuizResults,
    loadQuizData
  ]);

  return {
    handleNextQuestion
  };
};
