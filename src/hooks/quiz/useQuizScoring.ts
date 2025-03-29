
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

  const saveQuizResults = async (): Promise<void> => {
    if (!user) {
      console.error("Cannot save quiz results: No user logged in");
      return;
    }
    
    try {
      const currentQuizId = quizIds[quizState.currentQuizIndex];
      if (!currentQuizId) {
        console.error("Cannot save quiz results: Invalid quiz ID");
        return;
      }
      
      const { score, maxScore } = calculateScore();
      console.log(`Saving quiz results for quiz ${currentQuizId}, score: ${score}/${maxScore}`);
      
      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
      let skillLevel: string = 'Beginner';
      
      if (percentage >= 80) {
        skillLevel = 'Advanced';
      } else if (percentage >= 50) {
        skillLevel = 'Intermediate';
      }
      
      const currentCategory = categories.find(c => c.quiz_id === currentQuizId);
      
      if (currentCategory) {
        console.log(`Updating user skill level for category ${currentCategory.id} to ${skillLevel}`);
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
          throw interestError;
        }
      } else {
        console.warn(`No category found for quiz ${currentQuizId}`);
      }
      
      // Save quiz result in user_quiz_results table
      const { data: existingResult, error: checkError } = await supabase
        .from('user_quiz_results')
        .select('*')
        .eq('user_id', user.id)
        .eq('quiz_id', currentQuizId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking for existing quiz result:", checkError);
      }
      
      let saveError;
      if (existingResult) {
        // Update existing result if score is higher
        if (score > (existingResult.score || 0)) {
          const { error } = await supabase
            .from('user_quiz_results')
            .update({ score: score })
            .eq('id', existingResult.id);
          saveError = error;
        }
      } else {
        // Insert new result
        const { error } = await supabase
          .from('user_quiz_results')
          .insert({
            user_id: user.id,
            quiz_id: currentQuizId,
            score: score
          });
        saveError = error;
      }
        
      if (saveError) {
        console.error("Error saving quiz result:", saveError);
        throw saveError;
      }
      
      setQuizState(prev => ({
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [currentQuizId]: score
        }
      }));
      
      // Return type is Promise<void>, so we don't return anything
    } catch (error) {
      console.error("Error saving quiz results:", error);
      throw error;
    }
  };

  return { calculateScore, saveQuizResults };
};
