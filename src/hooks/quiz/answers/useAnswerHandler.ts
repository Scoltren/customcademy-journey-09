
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useArrayUtils } from '../utils/useArrayUtils';

// Hook for handling quiz answers
export const useAnswerHandler = () => {
  const [failedAnswerAttempts, setFailedAnswerAttempts] = useState<Record<number, number>>({});
  const { shuffleArray } = useArrayUtils();
  
  // Handle selecting an answer
  const handleSelectAnswer = useCallback((
    selectedAnswerIds: number[], 
    setSelectedAnswerIds: (ids: number[]) => void
  ) => (answerId: number) => {
    setSelectedAnswerIds(prev => {
      // Toggle the selected answer
      const updated = prev.includes(answerId)
        ? prev.filter(id => id !== answerId)
        : [...prev, answerId];
        
      console.log(`Selected answer IDs updated: ${updated.join(', ') || 'none'}`);
      
      return updated;
    });
  }, []);
  
  // Load the answers for a specific question
  const loadAnswersForQuestion = useCallback(async (
    questionId: number,
    setCurrentAnswers: (answers: any[]) => void,
    setSelectedAnswerIds: (ids: number[]) => void
  ) => {
    try {
      console.log(`Loading answers for question ID ${questionId}`);
      
      // Check if we've failed too many times for this question
      const attempts = failedAnswerAttempts[questionId] || 0;
      if (attempts >= 3) {
        console.log(`Too many failed attempts (${attempts}) for question ${questionId}, using dummy answers`);
        
        // Create dummy answers to prevent blocking the quiz
        const dummyAnswers = [
          { id: -1, question_id: questionId, answer_text: "Answer option 1", points: 1, explanation: "This is a fallback answer" },
          { id: -2, question_id: questionId, answer_text: "Answer option 2", points: 0, explanation: "This is a fallback answer" }
        ];
        
        setCurrentAnswers(dummyAnswers);
        setSelectedAnswerIds([]);
        return dummyAnswers;
      }
      
      const { data: answers, error } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', questionId);
      
      if (error) throw error;
      
      // If we got no answers, create dummy ones
      if (!answers || answers.length === 0) {
        console.log(`No answers available for question ${questionId}, using dummy answers`);
        
        const dummyAnswers = [
          { id: -1, question_id: questionId, answer_text: "Answer option 1", points: 1, explanation: "This is a fallback answer" },
          { id: -2, question_id: questionId, answer_text: "Answer option 2", points: 0, explanation: "This is a fallback answer" }
        ];
        
        setCurrentAnswers(dummyAnswers);
        setSelectedAnswerIds([]);
        return dummyAnswers;
      }
      
      // Randomize the order of answers before setting them
      const randomizedAnswers = shuffleArray(answers);
      
      setCurrentAnswers(randomizedAnswers);
      setSelectedAnswerIds([]);
      
      console.log(`Loaded ${randomizedAnswers.length || 0} answers for question ID ${questionId}`);
      
      // Reset failed attempts counter for this question
      if (attempts > 0) {
        setFailedAnswerAttempts(prev => ({...prev, [questionId]: 0}));
      }
      
      return answers;
    } catch (error) {
      console.error("Error loading answers:", error);
      
      // Track failed attempts for this question
      setFailedAnswerAttempts(prev => ({
        ...prev, 
        [questionId]: (prev[questionId] || 0) + 1
      }));
      
      // Create dummy answers after failure to prevent blocking the quiz
      const dummyAnswers = [
        { id: -1, question_id: questionId, answer_text: "Answer option 1", points: 1, explanation: "This is a fallback answer" },
        { id: -2, question_id: questionId, answer_text: "Answer option 2", points: 0, explanation: "This is a fallback answer" }
      ];
      
      setCurrentAnswers(dummyAnswers);
      setSelectedAnswerIds([]);
      
      toast.error("Failed to load question answers");
      return dummyAnswers;
    }
  }, [shuffleArray, failedAnswerAttempts]);
  
  return {
    handleSelectAnswer,
    loadAnswersForQuestion
  };
};
