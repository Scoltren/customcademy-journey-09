
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QuizState } from "@/types/quiz";
import { fetchNextQuizData } from "./useNextQuizFetcher";

/**
 * Hook to handle quiz navigation logic
 */
export const useQuizNavigation = (
  quizIds: number[],
  quizState: QuizState,
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  saveQuizResults: () => Promise<void>
) => {
  const navigate = useNavigate();

  const moveToNextQuestion = () => {
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1
    }));
  };

  const moveToNextQuiz = async () => {
    const nextQuizIndex = quizState.currentQuizIndex + 1;
    const nextQuizId = quizIds[nextQuizIndex];
    
    setIsLoading(true);
    const success = await fetchNextQuizData(nextQuizId, setQuizState, nextQuizIndex);
    setIsLoading(false);
    
    if (!success) {
      navigate("/dashboard");
    }
  };

  const completeAllQuizzes = () => {
    toast.success("All quizzes completed!");
    navigate("/dashboard");
  };

  const handleNextQuestion = async () => {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    
    if (!quizState.selectedAnswers[currentQuestion?.id]) {
      toast.error("Please select an answer");
      return;
    }
    
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      moveToNextQuestion();
    } else {
      await saveQuizResults();
      
      if (quizState.currentQuizIndex < quizIds.length - 1) {
        await moveToNextQuiz();
      } else {
        completeAllQuizzes();
      }
    }
  };

  return { handleNextQuestion };
};
