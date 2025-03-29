
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Question {
  id: number;
  question_text: string;
  multiple_correct?: boolean;
  answers: Answer[];
}

interface Answer {
  id: number;
  answer_text: string;
  points: number;
  explanation: string | null;
}

export const useQuizData = (quizId: number) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setIsLoading(true);
        
        // First get the questions for this quiz
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId);
        
        if (questionsError) throw questionsError;
        
        if (!questionsData || questionsData.length === 0) {
          console.log('No questions found for quiz ID:', quizId);
          setQuestions([]);
          setIsLoading(false);
          return;
        }
        
        // For each question, get its answers
        const questionsWithAnswers = await Promise.all(
          questionsData.map(async (question) => {
            const { data: answersData, error: answersError } = await supabase
              .from('answers')
              .select('*')
              .eq('question_id', question.id);
            
            if (answersError) throw answersError;
            
            // Check if this question has multiple correct answers
            const correctAnswers = answersData?.filter(answer => answer.points > 0) || [];
            const multiple_correct = correctAnswers.length > 1;
            
            return {
              ...question,
              answers: answersData || [],
              multiple_correct
            };
          })
        );
        
        console.log('Questions with answers:', questionsWithAnswers);
        setQuestions(questionsWithAnswers);
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        toast.error('Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  return { questions, isLoading };
};
