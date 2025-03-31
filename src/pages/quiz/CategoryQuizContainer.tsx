
import React, { useEffect, useState, useCallback } from "react";
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
        categoriesLength: categories.length,
        quizIds: quizIds,
        categories: categories.map(c => c?.name || 'unknown')
      });
    }
  }, [quizIds, categories]);
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  
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
    updateScore,
    logQuizState
  } = useQuiz(user, quizIds, categories);
  
  // Debug current category and quiz ID whenever they change
  useEffect(() => {
    if (currentCategory) {
      console.log(`CONTAINER - Currently showing quiz for category: ${currentCategory.name} (ID: ${currentCategory.id})`);
      console.log(`CONTAINER - Current quiz ID: ${quizIds[0]}`); // Always use the first quiz in the array
    }
  }, [currentCategory, quizIds]);
  
  // Set a maximum loading time to prevent infinite loading
  useEffect(() => {
    if (isLoading && !loadTimeout) {
      const timeout = setTimeout(() => {
        if (isLoading) {
          console.log("CONTAINER - Loading timeout reached, redirecting to home");
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
      console.log("CONTAINER - No quiz IDs or categories provided, redirecting to home");
      navigate('/');
    }
  }, [quizIds, categories, navigate]);
  
  // Handle when all quizzes are completed
  useEffect(() => {
    if (isCompleted) {
      console.log("CONTAINER - All quizzes completed, redirecting to home");
      toast.success("All quizzes completed! Your results have been saved.");
      navigate('/');
    }
  }, [isCompleted, navigate]);
  
  // Debug current quiz state on state changes
  useEffect(() => {
    console.log("CONTAINER - Logging quiz state");
    logQuizState();
  }, [quizState, quizIds.length, currentCategory, isCompleted, logQuizState]);
  
  // Handle submitting an answer
  const handleSubmitAnswer = useCallback(() => {
    // Calculate if any selected answers are correct
    const correctAnswers = currentAnswers.filter(a => a.points > 0);
    const correctlySelected = currentAnswers
      .filter(a => selectedAnswerIds.includes(a.id) && a.points > 0)
      .length;
    
    console.log(`CONTAINER - Submitting answer:`, {
      selectedIds: selectedAnswerIds,
      totalCorrectAnswers: correctAnswers.length,
      correctlySelected
    });
    
    // Update the score
    if (correctlySelected > 0) {
      updateScore(correctlySelected);
    }
    
    setShowFeedback(true);
  }, [currentAnswers, selectedAnswerIds, updateScore]);
  
  // Handle moving to the next question
  const handleNextQuestionClick = useCallback(() => {
    if (isNavigating) {
      console.log("CONTAINER - Already navigating, ignoring click");
      return;
    }
    
    setIsNavigating(true);
    setIsSaving(true);
    setShowFeedback(false);
    
    console.log("CONTAINER - Moving to next question/quiz", {
      currentQuestionIndex: quizState.currentQuestionIndex,
      isLastQuestion: quizState.currentQuestionIndex === quizState.questions.length - 1,
      remainingQuizzes: quizIds.length,
      quizIds: quizIds
    });
    
    // Call handleNextQuestion with a small delay to show saving state
    setTimeout(() => {
      handleNextQuestion();
      setIsSaving(false);
      setTimeout(() => {
        setIsNavigating(false);
      }, 500);
    }, 300);
  }, [quizState, quizIds, handleNextQuestion, isNavigating]);

  // Compute derived props for the view component
  const isLastQuestion = quizState.currentQuestionIndex === quizState.questions.length - 1;
  const isLastQuiz = quizIds.length <= 1;
  
  return (
    <CategoryQuizView
      isLoading={isLoading}
      isCompleted={isCompleted}
      hasQuestions={quizState.questions.length > 0}
      currentQuizIndex={0} // Always 0 in the new approach
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
