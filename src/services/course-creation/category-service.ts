
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Category } from "./types";

/**
 * Service class for category-related operations
 */
export class CategoryService {
  /**
   * Gets all categories
   * @returns List of categories
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      
      if (error) {
        toast.error('Failed to fetch categories. Please try again.');
        return [];
      }
      
      return data || [];
    } catch (error) {
      toast.error('Failed to fetch categories. Please try again.');
      return [];
    }
  }
}
