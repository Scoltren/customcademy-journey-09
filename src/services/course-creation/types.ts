
import { User } from "@supabase/supabase-js";

// Constants
export const BUCKET_NAME = "course-media";

export interface Category {
  id: number;
  name: string;
  quiz_id: number | null;
}

export interface CourseFormData {
  title: string;
  description: string;
  difficulty_level: string;
  category_id: number;
  course_time: number;
  price: number;
  thumbnail: File | null;
}

export interface ChapterFormData {
  title: string;
  chapter_text: string;
  progress_when_finished: number;
  video_file: File | null;
}

