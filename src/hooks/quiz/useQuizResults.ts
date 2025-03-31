
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateDifficultyLevel } from './utils/calculateDifficultyLevel';
import { toast } from 'sonner';

export const useQuizResults = (user: any) => {
  const [savedQuizIds, setSavedQuizIds] = useState<number[]>([]);

  // Save quiz results and update difficulty level
  const saveQuizResults = useCallback(async (
    quizId: number,
    score: number,
    categoryId?: number
  ): Promise<boolean> => {
    if (!user) return false;
    
    // Check if this quiz is already saved
    if (savedQuizIds.includes(quizId)) {
      console.log(`Quiz ${quizId} results already saved, skipping.`);
      return true;
    }
    
    try {
      console.log(`Saving quiz ${quizId} results with score ${score}`);
      
      // First, delete any existing results for this quiz and user
      const { error: deleteError } = await supabase
        .from('user_quiz_results')
        .delete()
        .eq('user_id', user.id)
        .eq('quiz_id', quizId);
      
      if (deleteError) {
        console.error("Error deleting previous quiz results:", deleteError);
        // Continue with insert anyway
      }
      
      // Save the new quiz result
      const { error: resultError } = await supabase
        .from('user_quiz_results')
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          score: score
        });
      
      if (resultError) throw resultError;
      
      // Mark this quiz as saved to prevent duplicates
      setSavedQuizIds(prev => [...prev, quizId]);
      
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
      toast.error("Failed to save quiz results");
      return false;
    }
  }, [user, savedQuizIds]);

  return {
    savedQuizIds,
    saveQuizResults
  };
};
