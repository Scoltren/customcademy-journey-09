
import { supabase } from '@/integrations/supabase/client';
import { calculateDifficultyLevel } from './utils/calculateDifficultyLevel';

/**
 * Saves quiz results and updates user difficulty level in their interests
 * 
 * @param user User object from auth context
 * @param quizId ID of the completed quiz
 * @param score User's score on the quiz
 * @param categoryId Category ID associated with the quiz
 * @returns Boolean indicating success or failure
 */
export const saveQuizResults = async (
  user: any,
  quizId: number,
  score: number,
  categoryId?: number
): Promise<boolean> => {
  if (!user) return false;
  
  try {
    // First, delete any existing results for this quiz and user
    console.log(`Deleting previous quiz results for user ${user.id} and quiz ${quizId}`);
    const { error: deleteError } = await supabase
      .from('user_quiz_results')
      .delete()
      .eq('user_id', user.id)
      .eq('quiz_id', quizId);
    
    if (deleteError) {
      console.error("Error deleting previous quiz results:", deleteError);
      // Continue with insert anyway
    }
    
    // Save the quiz result
    const { error: resultError } = await supabase
      .from('user_quiz_results')
      .insert({
        user_id: user.id,
        quiz_id: quizId,
        score: score
      });
    
    if (resultError) throw resultError;
    
    // If we have a category, update the user's interest for this category
    if (categoryId) {
      // Calculate difficulty level based on score
      const difficultyLevel = calculateDifficultyLevel(score);
      
      console.log(`Updating user interest for category ${categoryId} with difficulty level: ${difficultyLevel}`);
      
      // Check if user already has this category in their interests
      const { data: existingInterest, error: interestQueryError } = await supabase
        .from('user_interest_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('category_id', categoryId)
        .maybeSingle();
      
      if (interestQueryError) throw interestQueryError;
      
      if (existingInterest) {
        // Update existing interest with new difficulty level
        const { error: updateError } = await supabase
          .from('user_interest_categories')
          .update({ difficulty_level: difficultyLevel })
          .eq('user_id', user.id)
          .eq('category_id', categoryId);
        
        if (updateError) throw updateError;
      } else {
        // Insert new interest with difficulty level
        const { error: insertError } = await supabase
          .from('user_interest_categories')
          .insert({
            user_id: user.id,
            category_id: categoryId,
            difficulty_level: difficultyLevel
          });
        
        if (insertError) throw insertError;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error saving quiz results:", error);
    return false;
  }
};
