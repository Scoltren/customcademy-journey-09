
import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { QuizContent } from "@/components/quiz/QuizContent";
import { QuizFooter } from "@/components/quiz/QuizFooter";
import { useQuiz } from "@/hooks/useQuiz";
import { Category } from "@/types/quiz";

const CategoryQuiz = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { quizIds = [], categories = [] } = location.state || {};

  const {
    quizState,
    isLoading,
    currentCategory,
    currentQuestion,
    currentAnswers,
    selectedAnswerIds,
    handleSelectAnswer,
    handleNextQuestion
  } = useQuiz(user, quizIds, categories);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
        <div className="text-white text-xl">Loading quiz...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
      <div className="w-full max-w-3xl">
        <Card className="backdrop-blur-sm bg-slate-950 border-slate-800 shadow-xl transition-all duration-300">
          <QuizHeader
            quizIndex={quizState.currentQuizIndex}
            totalQuizzes={quizIds.length}
            questionIndex={quizState.currentQuestionIndex}
            totalQuestions={quizState.questions.length}
            currentCategory={currentCategory}
            currentQuestion={currentQuestion}
          />
          
          <QuizContent
            currentAnswers={currentAnswers}
            selectedAnswerIds={selectedAnswerIds}
            currentQuestion={currentQuestion}
            onSelectAnswer={handleSelectAnswer}
          />
          
          <QuizFooter
            currentQuestion={currentQuestion}
            hasSelectedAnswers={selectedAnswerIds.length > 0}
            isLastQuestion={quizState.currentQuestionIndex === quizState.questions.length - 1}
            isLastQuiz={quizState.currentQuizIndex === quizIds.length - 1}
            onNext={handleNextQuestion}
          />
        </Card>
      </div>
    </div>
  );
};

export default CategoryQuiz;
