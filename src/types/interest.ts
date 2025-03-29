
export interface UserInterest {
  user_id: string;
  category_id: number;
  difficulty_level?: string | null;
  created_at?: string | null;
  category?: {
    id: number;
    name: string;
  };
}
