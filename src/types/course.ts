
export interface Chapter {
  id: number;
  chapter_text: string;
  video_link: string | null;
  title?: string;
  course_id?: number;
}

export interface Course {
  id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  difficulty_level: string | null;
  overall_rating: number | null;
  price: number | null;
  media: string | null;
  category_id: number | null;
  creator_id: number | null;
  created_at: string | null;
  course_time: number | null;
}

export interface Comment {
  id: number;
  comment_text: string;
  user_id: number | null;
  created_at: string | null;
  rating?: number;
  username?: string;
  users?: {
    username: string;
  };
}
