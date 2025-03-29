
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
    
    return { score, maxScore, percentage: maxScore > 0 ? (score / maxScore) * 100 : 0 };
  };

  const saveQuizResults = async (): Promise<void> => {
    if (!user) {
      console.error("Cannot save quiz results: No user logged in");
      toast.error("Login required to save quiz results");
      return;
    }
    
    try {
      const currentQuizId = quizIds[quizState.currentQuizIndex];
      if (!currentQuizId) {
        console.error("Cannot save quiz results: Invalid quiz ID");
        toast.error("Could not identify the current quiz");
        return;
      }
      
      const { score, maxScore, percentage } = calculateScore();
      console.log(`Saving quiz results for quiz ${currentQuizId}, score: ${score}/${maxScore} (${percentage.toFixed(1)}%)`);
      
      let skillLevel: string = 'Beginner';
      
      if (percentage >= 80) {
        skillLevel = 'Advanced';
      } else if (percentage >= 50) {
        skillLevel = 'Intermediate';
      }
      
      const currentCategory = categories.find(c => c.quiz_id === currentQuizId);
      
      if (currentCategory) {
        console.log(`Updating user skill level for category ${currentCategory.id} to ${skillLevel}`);
        
        // Check if the user interest category record exists
        const { data: existingInterest, error: interestError } = await supabase
          .from('user_interest_categories')
          .select('*')
          .eq('user_id', user.id)
          .eq('category_id', currentCategory.id)
          .maybeSingle();
        
        if (interestError) {
          console.error('Error checking user interest:', interestError);
          throw interestError;
        }
        
        // If record exists, update it; otherwise, insert a new one
        if (existingInterest) {
          const { error: updateError } = await supabase
            .from('user_interest_categories')
            .update({ difficulty_level: skillLevel })
            .eq('user_id', user.id)
            .eq('category_id', currentCategory.id);
            
          if (updateError) {
            console.error('Error updating user skill level:', updateError);
            throw updateError;
          }
        } else {
          const { error: insertError } = await supabase
            .from('user_interest_categories')
            .insert({
              user_id: user.id,
              category_id: currentCategory.id,
              difficulty_level: skillLevel
            });
            
          if (insertError) {
            console.error('Error inserting user skill level:', insertError);
            throw insertError;
          }
        }
      } else {
        console.warn(`No category found for quiz ${currentQuizId}`);
      }
      
      // FIXED: Always delete existing quiz result before inserting a new one
      // This prevents duplicate entries and ensures we only have one result per quiz per user
      const { error: deleteError } = await supabase
        .from('user_quiz_results')
        .delete()
        .eq('user_id', user.id)
        .eq('quiz_id', currentQuizId);
      
      if (deleteError) {
        console.error('Error deleting previous quiz result:', deleteError);
        throw deleteError;
      }
      
      // Insert new result
      const { error: insertError } = await supabase
        .from('user_quiz_results')
        .insert({
          user_id: user.id,
          quiz_id: currentQuizId,
          score: score
        });
      
      if (insertError) {
        console.error("Error inserting quiz result:", insertError);
        throw insertError;
      }
      
      toast.success(`Quiz completed! Score: ${score}/${maxScore}`);
      
      // Update the local state with the new score
      setQuizState(prev => ({
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [currentQuizId]: score
        }
      }));
      
      return;
    } catch (error) {
      console.error("Error saving quiz results:", error);
      toast.error("Failed to save quiz results");
      throw error;
    }
  };

  return { calculateScore, saveQuizResults };
};
