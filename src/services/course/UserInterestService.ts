
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches user interests as category IDs
 */
export const fetchUserInterests = async (userId: string): Promise<number[]> => {
  const { data, error } = await supabase
    .from('user_interest_categories')
    .select('category_id')
    .eq('user_id', userId);
  
  if (error) {
    throw error;
  }
  
  return data?.map(item => Number(item.category_id)) || [];
};

/**
 * Fetches user skill levels for each category
 */
export const fetchUserSkillLevels = async (userId: string): Promise<{[key: number]: string}> => {
  const { data, error } = await supabase
    .from('user_interest_categories')
    .select('category_id, difficulty_level')
    .eq('user_id', userId);
    
  if (error) {
    throw error;
  }
  
  const skillLevels: {[key: number]: string} = {};
  data?.forEach(item => {
    if (item.category_id && item.difficulty_level) {
      skillLevels[item.category_id] = item.difficulty_level;
    }
  });
  
  return skillLevels;
};
