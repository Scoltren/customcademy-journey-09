
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  
  const navigate = useNavigate();

  // Handle moving to the next question or quiz
  const handleNextQuestion = useCallback(async (user: any, quizIds: number[], categories: any[]) => {
    console.log("NAVIGATION - Beginning navigation process with state:", {
      currentQuestionIndex: quizState.currentQuestionIndex,
      totalQuestions: quizState.questions.length,
      currentQuizIndex: quizState.currentQuizIndex,
      remainingQuizzes: quizIds.length,
      currentQuizId: quizIds[0], // Always use first quiz in array
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
        const currentQuizId = quizIds[0]; // Always use first quiz ID in array
        const currentCategory = categories[0]; // Always use first category in array
        
        console.log(`NAVIGATION - Saving quiz ${currentQuizId} results with score ${quizState.score}, category: ${currentCategory?.name}`);
        
        // Delete any previous results for this quiz and save new ones
        await saveQuizResults(
          currentQuizId, 
          quizState.score, 
          currentCategory?.id
        );
        
        // Remove the completed quiz from the array
        const remainingQuizIds = [...quizIds.slice(1)];
        const remainingCategories = [...categories.slice(1)];
        
        console.log("NAVIGATION - Remaining quizzes:", remainingQuizIds);
        
        // Check if there are more quizzes
        if (remainingQuizIds.length === 0) {
          console.log("NAVIGATION - All quizzes completed, redirecting to homepage");
          setIsCompleted(true);
          
          // Short delay to ensure state updates before navigation
          setTimeout(() => {
            navigate('/');
          }, 500);
          
          return;
        }
        
        console.log(`NAVIGATION - Moving to next quiz`);
        
        // Reset state for the next quiz
        setCurrentQuestion(null);
        setCurrentAnswers([]);
        setSelectedAnswerIds([]);
        
        // Reset the quiz state for the next quiz
        setQuizState({
          currentQuizIndex: 0, // Always keep as 0 since we're shifting arrays
          currentQuestionIndex: 0,
          questions: [],
          score: 0 // Reset score for the next quiz
        });
        
        // Force the component to re-render before loading the next quiz
        setTimeout(() => {
          console.log("NAVIGATION - Now loading quiz data for next quiz with remaining IDs:", remainingQuizIds);
          
          // Load the next quiz data with the updated arrays
          loadQuizData(remainingQuizIds, remainingCategories)
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
    loadQuizData,
    navigate
  ]);

  return {
    handleNextQuestion
  };
};
