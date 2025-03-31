
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuiz } from "@/hooks/quiz/useQuiz";

import QuizHeader from "@/components/quiz/QuizHeader";
import QuizContent from "@/components/quiz/QuizContent";
import QuizFooter from "@/components/quiz/QuizFooter";
import QuizLoading from "@/components/quiz/QuizLoading";
import QuizNotAvailable from "@/components/quiz/QuizNotAvailable";

const CategoryQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get the quiz IDs and categories from the location state
  const { quizIds = [], categories = [] } = location.state || {};
  
  // Log received quiz IDs and categories for debugging
  useEffect(() => {
    console.log("CategoryQuiz: Received quizIds:", quizIds);
    console.log("CategoryQuiz: Received categories:", categories);
  }, [quizIds, categories]);
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { 
    quizState, 
    isLoading, 
    currentCategory, 
    currentQuestion, 
    currentAnswers, 
    selectedAnswerIds, 
    handleSelectAnswer, 
    handleNextQuestion, 
    isCompleted,
    updateScore
  } = useQuiz(user, quizIds, categories);
  
  // If no quiz IDs were provided, redirect to home
  useEffect(() => {
    if (!quizIds.length || !categories.length) {
      navigate('/');
    }
  }, [quizIds, categories, navigate]);
  
  // Handle when all quizzes are completed
  useEffect(() => {
    if (isCompleted) {
      toast.success("All quizzes completed! Your results have been saved.");
      navigate('/');
    }
  }, [isCompleted, navigate]);
  
  // Handle submitting an answer
  const handleSubmitAnswer = () => {
    // Calculate if any selected answers are correct
    const correctlySelected = currentAnswers
      .filter(a => selectedAnswerIds.includes(a.id) && a.points > 0)
      .length;
    
    // Update the score
    if (correctlySelected > 0) {
      updateScore(correctlySelected);
    }
    
    setShowFeedback(true);
  };
  
  // Handle moving to the next question
  const handleNextQuestionClick = () => {
    setIsSaving(true);
    setShowFeedback(false);
    
    // Small delay to show saving state
    setTimeout(() => {
      handleNextQuestion();
      setIsSaving(false);
    }, 300);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
        <QuizLoading />
      </div>
    );
  }
  
  if (!quizState.questions.length && !isCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
        <QuizNotAvailable />
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
      <div className="w-full max-w-3xl">
        <Card className="backdrop-blur-sm bg-slate-950 border-slate-800 shadow-xl transition-all duration-300">
          <QuizHeader 
            currentQuizIndex={quizState.currentQuizIndex}
            totalQuizzes={quizIds.length}
            currentQuestionIndex={quizState.currentQuestionIndex}
            totalQuestions={quizState.questions.length}
            categoryName={currentCategory?.name}
            questionText={currentQuestion?.question_text}
          />
          
          <QuizContent
            answers={currentAnswers}
            selectedAnswerIds={selectedAnswerIds}
            showFeedback={showFeedback}
            handleSelectAnswer={handleSelectAnswer}
          />
          
          <QuizFooter 
            score={quizState.score}
            showFeedback={showFeedback}
            selectedAnswerIds={selectedAnswerIds}
            isSaving={isSaving}
            isLastQuestion={quizState.currentQuestionIndex === quizState.questions.length - 1}
            isLastQuiz={quizState.currentQuizIndex === quizIds.length - 1}
            onSubmitAnswer={handleSubmitAnswer}
            onNextQuestion={handleNextQuestionClick}
          />
        </Card>
      </div>
    </div>
  );
};

export default CategoryQuiz;
