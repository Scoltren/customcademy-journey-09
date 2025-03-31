
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useQuiz = (user: any, quizIds: number[], categories: any[]) => {
  const [quizState, setQuizState] = useState({
    currentQuizIndex: 0,
    currentQuestionIndex: 0,
    questions: [] as any[],
    score: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [currentAnswers, setCurrentAnswers] = useState<any[]>([]);
  const [selectedAnswerIds, setSelectedAnswerIds] = useState<number[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [savedQuizIds, setSavedQuizIds] = useState<number[]>([]);
  
  // Load the current quiz questions and first question's answers
  const loadQuizData = useCallback(async () => {
    if (!quizIds.length || quizState.currentQuizIndex >= quizIds.length) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentQuizId = quizIds[quizState.currentQuizIndex];
      
      // Set current category
      setCurrentCategory(categories[quizState.currentQuizIndex] || null);
      
      // Fetch questions for the current quiz
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', currentQuizId);
      
      if (questionsError) throw questionsError;
      
      if (!questions || !questions.length) {
        toast.error("No questions available for this quiz");
        return;
      }
      
      // Set questions and current question
      setQuizState(prev => ({
        ...prev,
        questions: questions,
        currentQuestionIndex: 0
      }));
      
      setCurrentQuestion(questions[0]);
      
      // Load answers for the first question
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', questions[0].id);
      
      if (answersError) throw answersError;
      
      setCurrentAnswers(answers || []);
      setSelectedAnswerIds([]);
      
    } catch (error) {
      console.error("Error loading quiz data:", error);
      toast.error("Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  }, [quizIds, categories, quizState.currentQuizIndex]);
  
  // Initialize or move to next quiz
  const handleNextQuestion = useCallback(async () => {
    // Check if we need to move to the next question
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      // Move to the next question in the current quiz
      const nextIndex = quizState.currentQuestionIndex + 1;
      const nextQuestion = quizState.questions[nextIndex];
      
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex
      }));
      
      setCurrentQuestion(nextQuestion);
      setSelectedAnswerIds([]);
      
      // Load answers for the next question
      try {
        const { data: answers, error } = await supabase
          .from('answers')
          .select('*')
          .eq('question_id', nextQuestion.id);
        
        if (error) throw error;
        setCurrentAnswers(answers || []);
      } catch (error) {
        console.error("Error loading answers:", error);
        toast.error("Failed to load question answers");
      }
    } else {
      // Move to the next quiz
      const nextQuizIndex = quizState.currentQuizIndex + 1;
      
      setQuizState(prev => ({
        ...prev,
        currentQuizIndex: nextQuizIndex,
        currentQuestionIndex: 0,
        questions: []
      }));
      
      // If there are more quizzes, load the next one
      if (nextQuizIndex < quizIds.length) {
        setIsLoading(true);
        
        // Reset current question and answers
        setCurrentQuestion(null);
        setCurrentAnswers([]);
        setSelectedAnswerIds([]);
        
        // Set a small timeout to allow state updates to propagate
        setTimeout(() => {
          loadQuizData();
        }, 100);
      }
    }
  }, [quizState, quizIds, loadQuizData]);
  
  // Initialize quiz on first load
  useEffect(() => {
    if (quizIds.length > 0) {
      loadQuizData();
    }
  }, [quizIds, loadQuizData]);
  
  // Handle selecting an answer
  const handleSelectAnswer = useCallback((answerId: number) => {
    setSelectedAnswerIds(prev => {
      // Toggle the selected answer
      return prev.includes(answerId)
        ? prev.filter(id => id !== answerId)
        : [...prev, answerId];
    });
  }, []);
  
  // Calculate difficulty level based on score
  const calculateDifficultyLevel = useCallback((score: number): string => {
    // Assuming quiz has around 10 questions
    if (score >= 8) {
      return 'advanced';
    } else if (score >= 5) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }, []);
  
  // Save quiz results and update difficulty level
  const saveQuizResults = useCallback(async () => {
    if (!user || !quizIds.length) return;
    
    try {
      const currentQuizId = quizIds[quizState.currentQuizIndex];
      
      // Check if we've already saved this quiz result to prevent duplicates
      if (savedQuizIds.includes(currentQuizId)) {
        console.log(`Quiz ${currentQuizId} results already saved, skipping.`);
        return;
      }
      
      // Save the quiz result
      const { error: resultError } = await supabase
        .from('user_quiz_results')
        .insert({
          user_id: user.id,
          quiz_id: currentQuizId,
          score: quizState.score
        });
      
      if (resultError) throw resultError;
      
      // Mark this quiz as saved to prevent duplicates
      setSavedQuizIds(prev => [...prev, currentQuizId]);
      
      // Get the current category
      const currentCategoryId = categories[quizState.currentQuizIndex]?.id;
      
      if (currentCategoryId) {
        // Calculate difficulty level based on score
        const difficultyLevel = calculateDifficultyLevel(quizState.score);
        
        // Check if user already has this category in their interests
        const { data: existingInterest, error: interestQueryError } = await supabase
          .from('user_interest_categories')
          .select('*')
          .eq('user_id', user.id)
          .eq('category_id', currentCategoryId)
          .maybeSingle();
        
        if (interestQueryError) throw interestQueryError;
        
        if (existingInterest) {
          // Update existing interest with new difficulty level
          const { error: updateError } = await supabase
            .from('user_interest_categories')
            .update({ difficulty_level: difficultyLevel })
            .eq('user_id', user.id)
            .eq('category_id', currentCategoryId);
          
          if (updateError) throw updateError;
        } else {
          // Insert new interest with difficulty level
          const { error: insertError } = await supabase
            .from('user_interest_categories')
            .insert({
              user_id: user.id,
              category_id: currentCategoryId,
              difficulty_level: difficultyLevel
            });
          
          if (insertError) throw insertError;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error saving quiz results:", error);
      throw error;
    }
  }, [user, quizIds, quizState.currentQuizIndex, quizState.score, categories, savedQuizIds, calculateDifficultyLevel]);
  
  return {
    quizState,
    isLoading,
    currentCategory,
    currentQuestion,
    currentAnswers,
    selectedAnswerIds,
    handleSelectAnswer,
    handleNextQuestion,
    saveQuizResults
  };
};
