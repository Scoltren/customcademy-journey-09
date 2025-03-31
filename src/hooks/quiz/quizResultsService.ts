
import { supabase } from '@/integrations/supabase/client';

// Calculate difficulty level based on score
export const calculateDifficultyLevel = (score: number): string => {
  // Assuming quiz has around 10 questions
  if (score >= 8) {
    return 'Advanced';
  } else if (score >= 5) {
    return 'Intermediate';
  } else {
    return 'Beginner';
  }
};

// Save quiz results and update difficulty level
export const saveQuizResults = async (
  user: any,
  quizId: number,
  score: number,
  categoryId?: number
): Promise<boolean> => {
  if (!user) return false;
  
  try {
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
