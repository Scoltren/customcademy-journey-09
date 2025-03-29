
export interface Chapter {
  id: number;
  chapter_text: string;
  video_link: string | null;
  title?: string;
  course_id?: number;
  quiz_id?: number | null;
  progress_when_finished?: number | null;
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
  creator_id: number | null; // Changed from string to number to match database
  created_at: string | null;
  course_time: number | null;
  category_name?: string;
}

export interface Comment {
  id: number;
  comment_text: string;
  user_id: string | null; // This stays as string to match UUID in auth.users
  created_at: string | null;
  rating?: number;
  username?: string;
  users?: {
    username: string;
  };
}

export interface EnrollmentStatus {
  enrolled: boolean;
  progress: number;
}
