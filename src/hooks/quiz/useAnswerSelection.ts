
import { QuizState } from "@/types/quiz";

/**
 * Hook to manage answer selection logic
 */
export const useAnswerSelection = (
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>
) => {
  const handleSelectAnswer = (answerId: number) => {
    setQuizState(prev => {
      const currentQuestion = prev.questions[prev.currentQuestionIndex];
      
      if (!currentQuestion) return prev;
      
      const currentSelected = prev.selectedAnswers[currentQuestion.id] || [];
      
      if (currentQuestion.multiple_correct) {
        if (currentSelected.includes(answerId)) {
          return {
            ...prev,
            selectedAnswers: {
              ...prev.selectedAnswers,
              [currentQuestion.id]: currentSelected.filter(id => id !== answerId)
            }
          };
        } else {
          return {
            ...prev,
            selectedAnswers: {
              ...prev.selectedAnswers,
              [currentQuestion.id]: [...currentSelected, answerId]
            }
          };
        }
      } else {
        return {
          ...prev,
          selectedAnswers: {
            ...prev.selectedAnswers,
            [currentQuestion.id]: [answerId]
          }
        };
      }
    });
  };

  return { handleSelectAnswer };
};
