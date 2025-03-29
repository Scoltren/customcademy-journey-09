
export interface UserInterest {
  id?: number;
  category_id: number;
  user_id: string;
  category?: {
    id: number;
    name: string;
  };
}
