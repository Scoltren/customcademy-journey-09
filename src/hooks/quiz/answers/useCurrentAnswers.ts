
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCurrentAnswers = () => {
  const [currentAnswers, setCurrentAnswers] = useState<any[]>([]);
  const [selectedAnswerIds, setSelectedAnswerIds] = useState<number[]>([]);
  const [failedQuestionLoads, setFailedQuestionLoads] = useState<Record<number, number>>({});

  // Load answers for a specific question
  const loadAnswersForQuestion = useCallback(async (questionId: number) => {
    try {
      console.log(`Loading answers for question ID ${questionId}`);
      
      // Check for too many failed attempts for this question
      const attempts = failedQuestionLoads[questionId] || 0;
      if (attempts >= 3) {
        console.warn(`Too many failed attempts (${attempts}) for question ${questionId}, using dummy answers`);
        
        // Create dummy answers
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
      
      // If no answers, use dummy ones
      if (!answers || answers.length === 0) {
        console.warn(`No answers found for question ${questionId}, using dummy answers`);
        
        const dummyAnswers = [
          { id: -1, question_id: questionId, answer_text: "Answer option 1", points: 1, explanation: "This is a fallback answer" },
          { id: -2, question_id: questionId, answer_text: "Answer option 2", points: 0, explanation: "This is a fallback answer" }
        ];
        
        setCurrentAnswers(dummyAnswers);
        setSelectedAnswerIds([]);
        return dummyAnswers;
      }
      
      // Random shuffle the answers
      const shuffledAnswers = [...answers].sort(() => Math.random() - 0.5);
      
      setCurrentAnswers(shuffledAnswers);
      setSelectedAnswerIds([]);
      
      console.log(`Loaded ${shuffledAnswers.length} answers for question ID ${questionId}`);
      
      // Reset the failed attempt counter if any
      if (failedQuestionLoads[questionId]) {
        setFailedQuestionLoads(prev => ({...prev, [questionId]: 0}));
      }
      
      return shuffledAnswers;
    } catch (error) {
      console.error("Error loading answers:", error);
      
      // Increment the failure counter for this question
      setFailedQuestionLoads(prev => ({
        ...prev, 
        [questionId]: (prev[questionId] || 0) + 1
      }));
      
      // Create dummy answers after failure
      const dummyAnswers = [
        { id: -1, question_id: questionId, answer_text: "Answer option 1", points: 1, explanation: "This is a fallback answer" },
        { id: -2, question_id: questionId, answer_text: "Answer option 2", points: 0, explanation: "This is a fallback answer" }
      ];
      
      setCurrentAnswers(dummyAnswers);
      setSelectedAnswerIds([]);
      
      toast.error("Failed to load question answers");
      return dummyAnswers;
    }
  }, [failedQuestionLoads]);

  // Handle selecting an answer
  const handleSelectAnswer = useCallback((answerId: number) => {
    setSelectedAnswerIds(prev => {
      // Toggle the selected answer
      return prev.includes(answerId)
        ? prev.filter(id => id !== answerId)
        : [...prev, answerId];
    });
  }, []);

  return {
    currentAnswers,
    setCurrentAnswers,
    selectedAnswerIds,
    setSelectedAnswerIds,
    handleSelectAnswer,
    loadAnswersForQuestion
  };
};
