
import { QuizState } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook to handle quiz scoring and result saving
 */
export const useQuizScoring = (
  user: any,
  quizIds: number[],
  categories: any[],
  quizState: QuizState,
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>
) => {
  const calculateScore = () => {
    let score = 0;
    let maxScore = 0;
    const currentQuizId = quizIds[quizState.currentQuizIndex];
    
    quizState.questions.forEach((question, index) => {
      const selectedAnswerIds = quizState.selectedAnswers[question.id] || [];
      const questionAnswers = quizState.answers[index] || [];
      
      const correctAnswers = questionAnswers.filter(a => a.points && a.points > 0);
      correctAnswers.forEach(answer => {
        maxScore += answer.points || 0;
      });
      
      questionAnswers.forEach(answer => {
        if (selectedAnswerIds.includes(answer.id) && answer.points) {
          score += answer.points > 0 ? answer.points : 0;
        }
      });
    });
    
    return { score, maxScore };
  };

  const saveQuizResults = async () => {
    if (!user) return;
    
    try {
      const currentQuizId = quizIds[quizState.currentQuizIndex];
      const { score, maxScore } = calculateScore();
      
      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
      let skillLevel: string = 'Beginner';
      
      if (percentage >= 80) {
        skillLevel = 'Advanced';
      } else if (percentage >= 50) {
        skillLevel = 'Intermediate';
      }
      
      const currentCategory = categories.find(c => c.quiz_id === currentQuizId);
      
      if (currentCategory) {
        const { error: interestError } = await supabase
          .from('user_interest_categories')
          .upsert({
            user_id: user.id,
            category_id: currentCategory.id,
            difficulty_level: skillLevel
          }, {
            onConflict: 'user_id,category_id'
          });
          
        if (interestError) {
          console.error('Error saving user skill level:', interestError);
        }
      }
      
      const { error } = await supabase
        .from('user_quiz_results')
        .insert({
          user_id: user.id,
          quiz_id: currentQuizId,
          score: score
        });
        
      if (error) throw error;
      
      setQuizState(prev => ({
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [currentQuizId]: score
        }
      }));
      
      const message = percentage >= 50 
        ? `Quiz completed! Your skill level: ${skillLevel}`
        : `Quiz completed! Keep practicing to improve your skills.`;
      
      toast.success(message);
    } catch (error) {
      console.error("Error saving quiz results:", error);
      toast.error("Failed to save quiz results");
    }
  };

  return { calculateScore, saveQuizResults };
};
