
import { useQuizState } from "./useQuizState";
import { useQuizFetcher } from "./useQuizFetcher";
import { useAnswerSelection } from "./useAnswerSelection";
import { useQuizScoring } from "./useQuizScoring";
import { useQuizNavigation } from "./useQuizNavigation";
import { fetchNextQuizData } from "./useNextQuizFetcher";
import { Category } from "@/types/quiz";

/**
 * Main quiz hook that combines all the sub-hooks
 */
export const useQuiz = (user: any, quizIds: number[], categories: Category[]) => {
  // Initialize quiz state
  const {
    quizState,
    setQuizState,
    isLoading,
    setIsLoading,
    currentCategory,
    currentQuestion,
    currentAnswers,
    selectedAnswerIds
  } = useQuizState(quizIds, categories);

  // Fetch quiz data
  useQuizFetcher(user, quizIds, setQuizState, setIsLoading);

  // Handle answer selection
  const { handleSelectAnswer } = useAnswerSelection(setQuizState);

  // Handle quiz scoring
  const { calculateScore, saveQuizResults } = useQuizScoring(
    user,
    quizIds,
    categories,
    quizState,
    setQuizState
  );

  // Handle navigation
  const { handleNextQuestion } = useQuizNavigation(
    quizIds,
    quizState,
    setQuizState,
    setIsLoading,
    saveQuizResults
  );

  return {
    quizState,
    isLoading,
    currentCategory,
    currentQuestion,
    currentAnswers,
    selectedAnswerIds,
    handleSelectAnswer,
    handleNextQuestion,
    calculateScore,
    saveQuizResults
  };
};
