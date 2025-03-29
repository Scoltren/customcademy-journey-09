
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { QuizContent } from "@/components/quiz/QuizContent";
import { QuizFooter } from "@/components/quiz/QuizFooter";
import { useQuiz } from "@/hooks/useQuiz";
import { Category } from "@/types/quiz";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CategoryQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { quizIds = [], categories = [] } = location.state || {};
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const {
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
  } = useQuiz(user, quizIds, categories);

  // Handle saving results when the quiz is completed
  useEffect(() => {
    const saveResultsIfCompleted = async () => {
      if (quizCompleted) {
        try {
          console.log("Saving quiz results...");
          await saveQuizResults();
          setQuizCompleted(false);
          
          const currentQuizId = quizIds[quizState.currentQuizIndex];
          const { score, maxScore } = calculateScore();
          const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
          
          let message = `Quiz completed! Score: ${score}/${maxScore}`;
          if (percentage >= 80) {
            message += " - Advanced level";
          } else if (percentage >= 50) {
            message += " - Intermediate level";
          } else {
            message += " - Beginner level";
          }
          
          toast.success(message);
        } catch (error) {
          console.error("Error saving quiz results:", error);
          toast.error("Failed to save your quiz results");
        }
      }
    };
    
    saveResultsIfCompleted();
  }, [quizCompleted, quizState.currentQuizIndex]);

  const handleSubmitAnswer = () => {
    setShowFeedback(true);
  };

  const handleNextQuestionClick = () => {
    // If this is the last question and we're showing feedback,
    // mark the quiz as completed before moving to the next question/quiz
    if (quizState.currentQuestionIndex === quizState.questions.length - 1 && showFeedback) {
      setQuizCompleted(true);
    }
    
    setShowFeedback(false);
    handleNextQuestion();
    
    // If we've completed all quizzes, navigate back to courses
    if (quizState.currentQuizIndex >= quizIds.length) {
      navigate('/courses');
    }
  };

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
            showFeedback={showFeedback}
          />
          
          <QuizFooter
            currentQuestion={currentQuestion}
            hasSelectedAnswers={selectedAnswerIds.length > 0}
            isLastQuestion={quizState.currentQuestionIndex === quizState.questions.length - 1}
            isLastQuiz={quizState.currentQuizIndex === quizIds.length - 1}
            onNext={handleNextQuestionClick}
            onSubmit={handleSubmitAnswer}
            showFeedback={showFeedback}
          />
        </Card>
      </div>
    </div>
  );
};

export default CategoryQuiz;
