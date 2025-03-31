
import { useCallback, useMemo } from 'react';
import { useQuizStateManager } from './state/useQuizStateManager';
import { useAnswerHandler } from './answers/useAnswerHandler';

// Main hook that combines quiz state management and answer handling
export const useQuizState = (quizIds: number[]) => {
  // Get quiz state manager
  const quizStateManager = useQuizStateManager(quizIds);
  
  // Get answer handler
  const answerHandler = useAnswerHandler();
  
  // Create the loadAnswersForQuestion function by combining the dependencies
  const loadAnswersForQuestion = useCallback((questionId: number) => {
    return answerHandler.loadAnswersForQuestion(
      questionId,
      quizStateManager.setCurrentAnswers,
      quizStateManager.setSelectedAnswerIds
    );
  }, [
    answerHandler.loadAnswersForQuestion,
    quizStateManager.setCurrentAnswers,
    quizStateManager.setSelectedAnswerIds
  ]);
  
  // Create a handleSelectAnswer function that already has the necessary state
  const handleSelectAnswer = useMemo(() => 
    answerHandler.handleSelectAnswer(
      quizStateManager.selectedAnswerIds,
      quizStateManager.setSelectedAnswerIds
    ),
  [
    answerHandler.handleSelectAnswer,
    quizStateManager.selectedAnswerIds,
    quizStateManager.setSelectedAnswerIds
  ]);
  
  // Return all the state and functions from both hooks, plus combined functions
  return {
    ...quizStateManager,
    loadAnswersForQuestion,
    handleSelectAnswer
  };
};
