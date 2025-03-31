
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuiz } from "@/hooks/quiz/useQuiz";
import CategoryQuizView from "./CategoryQuizView";

const MAX_LOADING_TIME = 15000; // 15 seconds max loading time

const CategoryQuizContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get the quiz IDs and categories from the location state
  const { quizIds = [], categories = [] } = location.state || {};
  
  // Log received quiz IDs and categories for debugging
  useEffect(() => {
    console.log("CategoryQuiz: Received quizIds:", quizIds);
    console.log("CategoryQuiz: Received categories:", categories);
    
    if (quizIds.length !== categories.length) {
      console.error("Mismatch between quizIds and categories arrays!", {
        quizIdsLength: quizIds.length,
        categoriesLength: categories.length
      });
    }
  }, [quizIds, categories]);
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null);
  
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
  
  // Set a maximum loading time to prevent infinite loading
  useEffect(() => {
    if (isLoading && !loadTimeout) {
      const timeout = setTimeout(() => {
        if (isLoading) {
          console.log("Loading timeout reached, redirecting to home");
          toast.error("Quiz loading timed out. Please try again later.");
          navigate('/');
        }
      }, MAX_LOADING_TIME);
      
      setLoadTimeout(timeout);
    } else if (!isLoading && loadTimeout) {
      clearTimeout(loadTimeout);
      setLoadTimeout(null);
    }
    
    return () => {
      if (loadTimeout) clearTimeout(loadTimeout);
    };
  }, [isLoading, loadTimeout, navigate]);
  
  // If no quiz IDs were provided, redirect to home
  useEffect(() => {
    if (!quizIds.length || !categories.length) {
      console.log("No quiz IDs or categories provided, redirecting to home");
      navigate('/');
    }
  }, [quizIds, categories, navigate]);
  
  // Handle when all quizzes are completed
  useEffect(() => {
    if (isCompleted) {
      console.log("All quizzes completed, redirecting to home");
      toast.success("All quizzes completed! Your results have been saved.");
      navigate('/');
    }
  }, [isCompleted, navigate]);
  
  // Debug current quiz state
  useEffect(() => {
    console.log("Current quiz state:", {
      currentQuizIndex: quizState.currentQuizIndex,
      totalQuizzes: quizIds.length,
      currentQuestionIndex: quizState.currentQuestionIndex,
      totalQuestions: quizState.questions.length,
      currentCategory: currentCategory?.name,
      score: quizState.score,
      isCompleted
    });
  }, [quizState, quizIds.length, currentCategory, isCompleted]);
  
  // Handle submitting an answer
  const handleSubmitAnswer = () => {
    // Calculate if any selected answers are correct
    const correctAnswers = currentAnswers.filter(a => a.points > 0);
    const correctlySelected = currentAnswers
      .filter(a => selectedAnswerIds.includes(a.id) && a.points > 0)
      .length;
    
    console.log(`Submitting answer:`, {
      selectedIds: selectedAnswerIds,
      totalCorrectAnswers: correctAnswers.length,
      correctlySelected
    });
    
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
    
    console.log("Moving to next question/quiz", {
      currentQuizIndex: quizState.currentQuizIndex,
      currentQuestionIndex: quizState.currentQuestionIndex,
      isLastQuestion: quizState.currentQuestionIndex === quizState.questions.length - 1,
      isLastQuiz: quizState.currentQuizIndex === quizIds.length - 1
    });
    
    // Call handleNextQuestion with a small delay to show saving state
    setTimeout(() => {
      handleNextQuestion();
      setIsSaving(false);
    }, 300);
  };

  // Compute derived props for the view component
  const isLastQuestion = quizState.currentQuestionIndex === quizState.questions.length - 1;
  const isLastQuiz = quizState.currentQuizIndex === quizIds.length - 1;
  
  return (
    <CategoryQuizView
      isLoading={isLoading}
      isCompleted={isCompleted}
      hasQuestions={quizState.questions.length > 0}
      currentQuizIndex={quizState.currentQuizIndex}
      totalQuizzes={quizIds.length}
      currentQuestionIndex={quizState.currentQuestionIndex}
      totalQuestions={quizState.questions.length}
      categoryName={currentCategory?.name}
      questionText={currentQuestion?.question_text}
      currentAnswers={currentAnswers}
      selectedAnswerIds={selectedAnswerIds}
      showFeedback={showFeedback}
      score={quizState.score}
      isSaving={isSaving}
      isLastQuestion={isLastQuestion}
      isLastQuiz={isLastQuiz}
      handleSelectAnswer={handleSelectAnswer}
      handleSubmitAnswer={handleSubmitAnswer}
      handleNextQuestion={handleNextQuestionClick}
    />
  );
};

export default CategoryQuizContainer;
