
import { useState } from 'react';
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

interface QuizResult {
  score: number;
  maxScore: number;
  passed: boolean;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const useQuizState = (quizId: number, questions: Question[]) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number[]}>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<{[key: number]: number[]}>({});
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setSelectedAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      const question = questions.find(q => q.id === questionId);
      
      // If this is a single-answer question, replace previous selection
      if (!question?.multiple_correct) {
        return {
          ...prev,
          [questionId]: [answerId]
        };
      }
      
      // For multiple-answer questions, toggle the selection
      if (currentAnswers.includes(answerId)) {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(id => id !== answerId)
        };
      }
      
      // Add to the selection
      return {
        ...prev,
        [questionId]: [...currentAnswers, answerId]
      };
    });
  };

  const calculateScore = () => {
    let score = 0;
    let maxScore = 0;
    
    questions.forEach(question => {
      // Calculate max possible score (sum of all positive point values)
      const correctAnswers = question.answers.filter(answer => answer.points > 0);
      correctAnswers.forEach(answer => {
        maxScore += answer.points;
      });
      
      // Calculate user's score
      const selectedAnswerIds = selectedAnswers[question.id] || [];
      question.answers.forEach(answer => {
        if (selectedAnswerIds.includes(answer.id)) {
          // Add the points (can be positive or negative)
          score += answer.points;
        }
      });
    });
    
    // Determine skill level based on percentage score
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    let skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
    
    if (percentage >= 80) {
      skillLevel = 'Advanced';
    } else if (percentage >= 50) {
      skillLevel = 'Intermediate';
    }
    
    return {
      score,
      maxScore,
      passed: score > 0, // Consider passed if any points scored
      skillLevel
    };
  };

  const handleSubmit = async () => {
    const result = calculateScore();
    setQuizResult(result);
    setSubmittedAnswers({...selectedAnswers});
    setShowResults(true);
    
    try {
      // Get the category associated with this quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('category_id')
        .eq('id', quizId)
        .single();
      
      if (quizError) throw quizError;
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && quizData?.category_id) {
        // Store the user's skill level for this category
        const { error: interestError } = await supabase
          .from('user_interest_categories')
          .upsert({
            user_id: user.id,
            category_id: quizData.category_id,
            difficulty_level: result.skillLevel
          }, {
            onConflict: 'user_id,category_id'
          });
          
        if (interestError) {
          console.error('Error saving user skill level:', interestError);
        }
        
        // Store the quiz result
        const { error: resultError } = await supabase
          .from('user_quiz_results')
          .insert({
            user_id: user.id,
            quiz_id: quizId,
            score: result.score
          });
          
        if (resultError) {
          console.error('Error saving quiz result:', resultError);
        }
      }
    } catch (error) {
      console.error('Error processing quiz submission:', error);
    }
    
    if (result.score > 0) {
      toast.success(`You scored ${result.score}/${result.maxScore}. Skill level: ${result.skillLevel}`);
    } else {
      toast.error(`You scored ${result.score}/${result.maxScore}. Try again!`);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setShowResults(false);
    setQuizResult(null);
  };

  return {
    selectedAnswers,
    submittedAnswers,
    showResults,
    quizResult,
    handleAnswerSelect,
    handleSubmit,
    handleRetry
  };
};
