
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
    console.log("NAVIGATION - Beginning navigation process with state:", {
      currentQuestionIndex: quizState.currentQuestionIndex,
      totalQuestions: quizState.questions.length,
      remainingQuizzes: quizIds.length,
      currentQuizId: quizIds[0], // Always use the first quiz in the array
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
        const currentQuizId = quizIds[0]; // Always use the first quiz
        const currentCategory = categories[0]; // Use the category matching the first quiz
        
        console.log(`NAVIGATION - Saving quiz ${currentQuizId} results with score ${quizState.score}, category: ${currentCategory?.name}`);
        
        // Delete any previous results for this quiz and save new ones
        await saveQuizResults(
          currentQuizId, 
          quizState.score, 
          currentCategory?.id
        );
        
        // Remove the completed quiz from the array
        const updatedQuizIds = [...quizIds.slice(1)];
        const updatedCategories = [...categories.slice(1)];
        
        console.log(`NAVIGATION - Current quiz finished. Removing quiz ID ${currentQuizId} from list`);
        console.log(`NAVIGATION - Remaining quizzes: ${updatedQuizIds.length}`);
        
        // Check if there are more quizzes
        if (updatedQuizIds.length === 0) {
          console.log("NAVIGATION - All quizzes completed, no more quizzes available");
          setIsCompleted(true);
          return;
        }
        
        // Reset state for the next quiz
        setCurrentQuestion(null);
        setCurrentAnswers([]);
        setSelectedAnswerIds([]);
        
        // Reset quiz state completely for the next quiz
        console.log(`NAVIGATION - Resetting state before loading next quiz ID: ${updatedQuizIds[0]}`);
        
        setQuizState({
          currentQuizIndex: 0, // Always stay at index 0
          currentQuestionIndex: 0,
          questions: [],
          score: 0
        });
        
        // Force the component to re-render before loading the next quiz
        setTimeout(() => {
          console.log("NAVIGATION - Now loading quiz data for next quiz. Updated Quiz IDs:", updatedQuizIds);
          
          // Load the next quiz data with the updated quiz ID array
          loadQuizData(updatedQuizIds, updatedCategories)
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
