
import { useState } from "react";
import { Category, Question, QuizState } from "@/types/quiz";

/**
 * Hook to manage quiz state
 */
export const useQuizState = (quizIds: number[], categories: Category[]) => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuizIndex: 0,
    currentQuestionIndex: 0,
    questions: [],
    answers: [],
    selectedAnswers: {},
    quizScores: {},
  });

  const [isLoading, setIsLoading] = useState(true);

  // Additional helper getters
  const currentCategory = categories.find(c => c.quiz_id === quizIds[quizState.currentQuizIndex]);
  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  const currentAnswers = quizState.answers[quizState.currentQuestionIndex] || [];
  const selectedAnswerIds = currentQuestion ? (quizState.selectedAnswers[currentQuestion.id] || []) : [];
  
  return {
    quizState,
    setQuizState,
    isLoading,
    setIsLoading,
    currentCategory,
    currentQuestion,
    currentAnswers,
    selectedAnswerIds
  };
};
