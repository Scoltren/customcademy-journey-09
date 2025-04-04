
export interface Chapter {
  id: number;
  title: string;
  chapter_text: string;
  video_link: string | null;
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
  creator_id: string | null; // Changed from number to string to match UUID in auth.users
  created_at: string | null;
  course_time: number | null;
  category_name?: string | { name: string }; // Updated to accept both string and object
  // Add missing properties
  categories?: {
    name: string;
  } | null;
  chapters_count?: number;
}

export interface Comment {
  id: number;
  comment_text?: string | null; // Make comment_text optional since a user can submit only a rating
  user_id: string | null; // This stays as string to match UUID in auth.users
  created_at: string | null;
  rating?: number; // Rating field in the interface
  username?: string;
  profile_picture?: string | null; // Added profile_picture field to the Comment interface
  users?: {
    username: string;
    profile_picture?: string | null;
  };
  parent_comment_id?: number | null;
  type?: string | null;
  course_id?: number | null;
}

export interface EnrollmentStatus {
  enrolled: boolean;
  progress: number;
}
