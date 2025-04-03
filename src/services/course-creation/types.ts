// Storage bucket name for course assets
export const BUCKET_NAME = 'course-media';

// User interface type (imported from Supabase)
import { User } from "@supabase/supabase-js";

// Category type for course categories
export interface Category {
  id: number;
  name: string;
  quiz_id: number | null;
}

// Course form data interface for creating/updating courses
export interface CourseFormData {
  title: string;
  description: string;
  difficulty_level: string | null;
  category_id: number;
  course_time: number;
  price: number;
  thumbnail: File | null;
}

// Chapter form data interface for creating/updating chapters
export interface ChapterFormData {
  title: string;
  chapter_text: string;
  progress_when_finished: number;
  video_file: File | null;
}
