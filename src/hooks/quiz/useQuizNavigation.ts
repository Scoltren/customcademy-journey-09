
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
      currentQuizIndex: quizState.currentQuizIndex,
      currentQuestionIndex: quizState.currentQuestionIndex,
      totalQuestions: quizState.questions.length,
      totalQuizzes: quizIds.length,
      currentQuizId: quizIds[quizState.currentQuizIndex],
      nextQuizId: quizIds[quizState.currentQuizIndex + 1]
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
        
        // Delete any previous results for this quiz
        await saveQuizResults(
          currentQuizId, 
          quizState.score, 
          currentCategory?.id
        );
        
        // Move to the next quiz
        const nextQuizIndex = quizState.currentQuizIndex + 1;
        
        console.log(`NAVIGATION - Current quiz finished. Attempting to move to quiz index: ${nextQuizIndex}`);
        console.log(`NAVIGATION - Available quiz IDs: ${JSON.stringify(quizIds)}`);
        
        // Check if there are more quizzes
        if (nextQuizIndex >= quizIds.length) {
          console.log("NAVIGATION - All quizzes completed, no more quizzes available");
          setIsCompleted(true);
          return;
        }
        
        const nextQuizId = quizIds[nextQuizIndex];
        console.log(`NAVIGATION - Moving to next quiz index: ${nextQuizIndex}, quiz ID: ${nextQuizId}`);
        
        // Reset state for the next quiz
        setCurrentQuestion(null);
        setCurrentAnswers([]);
        setSelectedAnswerIds([]);
        
        // Update quiz state with the next quiz index BEFORE loading new data
        console.log(`NAVIGATION - Updating state to quiz index ${nextQuizIndex} before loading data`);
        
        setQuizState(prev => {
          const newState = {
            ...prev,
            currentQuizIndex: nextQuizIndex,
            currentQuestionIndex: 0,
            questions: [],
            score: 0
          };
          console.log("NAVIGATION - New quiz state:", newState);
          return newState;
        });
        
        // Force the component to re-render before loading the next quiz
        setTimeout(() => {
          console.log("NAVIGATION - Now loading quiz data for next quiz. Quiz IDs:", quizIds);
          console.log(`NAVIGATION - Loading quiz at index ${nextQuizIndex}, ID: ${quizIds[nextQuizIndex]}`);
          
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
