
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
    console.log("NAVIGATION - Current state before navigation:", {
      currentQuizIndex: quizState.currentQuizIndex,
      currentQuestionIndex: quizState.currentQuestionIndex,
      totalQuestions: quizState.questions.length,
      totalQuizzes: quizIds.length,
      currentQuizId: quizIds[quizState.currentQuizIndex]
    });
    
    try {
      // Check if we need to move to the next question
      if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
        // Move to the next question in the current quiz
        const nextIndex = quizState.currentQuestionIndex + 1;
        const nextQuestion = quizState.questions[nextIndex];
        
        console.log(`NAVIGATION - Moving to next question: ${nextIndex + 1}/${quizState.questions.length}`);
        
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
        
        console.log(`NAVIGATION - Saving quiz ${currentQuizId} results with score ${quizState.score}, category: ${currentCategory?.name}`);
        
        await saveQuizResults(
          currentQuizId, 
          quizState.score, 
          currentCategory?.id
        );
        
        // Move to the next quiz
        const nextQuizIndex = quizState.currentQuizIndex + 1;
        
        console.log(`NAVIGATION - Current quiz finished. Moving to next quiz index: ${nextQuizIndex}, next quiz ID: ${quizIds[nextQuizIndex]}`);
        
        // Check if there are more quizzes
        if (nextQuizIndex >= quizIds.length) {
          console.log("NAVIGATION - All quizzes completed");
          setIsCompleted(true);
          return;
        }
        
        // Reset state for the next quiz
        setCurrentQuestion(null);
        setCurrentAnswers([]);
        setSelectedAnswerIds([]);
        
        // Update quiz state with the next quiz index
        console.log(`NAVIGATION - Updating state to quiz index ${nextQuizIndex} before loading data`);
        
        // Update the state BEFORE we try to load data
        setQuizState(prev => ({
          ...prev,
          currentQuizIndex: nextQuizIndex,
          currentQuestionIndex: 0,
          questions: [],
          score: 0
        }));
        
        // Force the component to re-render before loading the next quiz
        setTimeout(() => {
          console.log("NAVIGATION - Now loading quiz data with index:", nextQuizIndex, "quizIds:", quizIds, "next quiz ID:", quizIds[nextQuizIndex]);
          
          // Load the next quiz data with a new quiz ID
          loadQuizData(quizIds, categories)
            .catch(error => {
              console.error("NAVIGATION - Error loading next quiz:", error);
              toast.error("Failed to load next quiz");
            });
        }, 300);
      }
    } catch (error) {
      console.error("NAVIGATION - Error in handleNextQuestion:", error);
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
