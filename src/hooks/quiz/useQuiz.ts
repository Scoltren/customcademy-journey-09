
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuizState } from './useQuizState';
import { useCurrentAnswers } from './answers/useCurrentAnswers';
import { useQuizResults } from './useQuizResults';
import { useQuizDataLoader } from './useQuizDataLoader';
import { useQuizNavigation } from './useQuizNavigation';

export const useQuiz = (quizIds: number[], categories: any[], user: any) => {
  // Track initial load
  const initialLoadRef = useRef(false);
  
  // Create state to manage the dynamic quiz and category arrays
  const [activeQuizIds, setActiveQuizIds] = useState<number[]>(quizIds);
  const [activeCategories, setActiveCategories] = useState<any[]>(categories);
  
  // Initialize quiz state
  const {
    quizState,
    setQuizState,
    isLoading,
    setIsLoading,
    currentQuestion,
    setCurrentQuestion,
    currentCategory,
    setCurrentCategory,
    isCompleted,
    setIsCompleted,
    updateScore
  } = useQuizState();
  
  // Initialize answers state
  const {
    currentAnswers,
    setCurrentAnswers,
    selectedAnswerIds,
    setSelectedAnswerIds,
    handleSelectAnswer,
    loadAnswersForQuestion
  } = useCurrentAnswers();
  
  // Create state manager for passing to other hooks
  const stateManager = {
    quizState,
    setQuizState,
    setIsLoading,
    setCurrentQuestion,
    setCurrentCategory,
    setIsCompleted,
    loadAnswersForQuestion,
    setSelectedAnswerIds,
    setCurrentAnswers
  };
  
  // Initialize quiz results
  const { saveQuizResults } = useQuizResults(user);
  
  // Initialize quiz data loader
  const { loadQuizData } = useQuizDataLoader(stateManager);
  
  // Initialize quiz navigation
  const { handleNextQuestion } = useQuizNavigation(
    stateManager,
    loadQuizData,
    saveQuizResults
  );
  
  // Load quiz data on first render or when quizIds change
  useEffect(() => {
    if (activeQuizIds.length > 0 && !initialLoadRef.current && !isCompleted) {
      initialLoadRef.current = true;
      console.log("Initial quiz load triggered", {
        quizIds: activeQuizIds.map(id => id),
        categories: activeCategories.map(c => c?.name || 'unknown'),
        initialLoadRef: initialLoadRef.current
      });
      
      // Reset state for a fresh start
      setQuizState({
        currentQuizIndex: 0,
        currentQuestionIndex: 0,
        questions: [],
        score: 0
      });
      
      // Load quiz data with a slight delay to ensure state is set
      setTimeout(() => {
        console.log("Loading initial quiz data with quizIds:", activeQuizIds);
        loadQuizData(activeQuizIds, activeCategories);
      }, 100);
    }
  }, [activeQuizIds, activeCategories, isCompleted, loadQuizData, setQuizState]);
  
  // Reset initial load ref when we receive new quiz IDs
  useEffect(() => {
    if (quizIds.length > 0) {
      // Update our quiz state with new quiz IDs
      setActiveQuizIds(quizIds);
      setActiveCategories(categories);
      
      // Reset the load state
      initialLoadRef.current = false;
      
      // Reset completion state
      setIsCompleted(false);
      
      // Reset quiz state to start from the beginning
      setQuizState({
        currentQuizIndex: 0,
        currentQuestionIndex: 0,
        questions: [],
        score: 0
      });
      
      console.log("Quiz IDs updated from props:", { 
        quizIds: quizIds.map(id => id),
        initialLoadRef: initialLoadRef.current
      });
    }
  }, [quizIds, categories, setIsCompleted, setQuizState]);
  
  // Handle submitting an answer
  const handleSubmitAnswer = useCallback(() => {
    // Logic for submitting an answer would go here
    console.log("Submitting answer:", selectedAnswerIds);
    
    // Calculate the score based on selected answers
    const correctAnswers = currentAnswers.filter(answer => 
      selectedAnswerIds.includes(answer.id) && answer.points > 0
    );
    
    const totalPoints = correctAnswers.reduce((sum, answer) => sum + answer.points, 0);
    console.log(`Points earned: ${totalPoints} from ${correctAnswers.length} correct answers`);
    updateScore(totalPoints);
    
    return totalPoints;
  }, [selectedAnswerIds, currentAnswers, updateScore]);
  
  // Handle finishing the quiz
  const handleFinishQuiz = useCallback(async () => {
    console.log("Finishing quiz");
    
    try {
      // Save results for the last quiz
      if (user && activeQuizIds.length > 0) {
        const currentQuizId = activeQuizIds[0]; // Always use first quiz in array
        const currentCategoryId = activeCategories[0]?.id;
        
        console.log(`Saving final quiz results for quiz ${currentQuizId}`);
        await saveQuizResults(currentQuizId, quizState.score, currentCategoryId);
      }
      
      // Make sure we properly mark as completed
      console.log("Setting isCompleted to true to trigger navigation to homepage");
      setIsCompleted(true);
      return true;
    } catch (error) {
      console.error("Error finishing quiz:", error);
      return false;
    }
  }, [quizState, activeQuizIds, activeCategories, user, saveQuizResults, setIsCompleted]);
  
  // Debug logging
  const logQuizState = useCallback(() => {
    console.log("Current Quiz State:", {
      quizIds: activeQuizIds.map(id => id),
      categories: activeCategories.map(c => c?.name || 'unknown'),
      currentQuizIndex: quizState.currentQuizIndex,
      currentQuestionIndex: quizState.currentQuestionIndex,
      score: quizState.score,
      totalQuestions: quizState.questions.length,
      isCompleted,
      isLoading,
      initialLoadRef: initialLoadRef.current
    });
  }, [quizState, activeQuizIds, activeCategories, isCompleted, isLoading]);

  return {
    quizState,
    isLoading,
    currentCategory,
    currentQuestion,
    currentAnswers,
    selectedAnswerIds,
    handleSelectAnswer,
    handleNextQuestion,
    handleSubmitAnswer,
    handleFinishQuiz,
    saveQuizResults,
    isCompleted,
    updateScore,
    logQuizState
  };
};
