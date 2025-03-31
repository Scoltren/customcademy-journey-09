import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the Category type to match the database structure
export interface Category {
  id: number;
  name: string;
  quiz_id: number | null;
}

// Constants
const BUCKET_NAME = "course-media";

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

export class CourseCreationService {
  /**
   * Uploads a file to Supabase storage
   * @param file The file to upload
   * @param path Optional path within the bucket
   * @returns URL of the uploaded file or null if upload failed
   */
  static async uploadFile(file: File, path?: string): Promise<string | null> {
    try {
      if (!file) {
        console.log("No file provided for upload");
        return null;
      }
      
      // Generate a unique file name to avoid collisions
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      const filePath = path ? `${path}/${fileName}` : fileName;
      
      console.log(`Uploading file to ${BUCKET_NAME}/${filePath}`);
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error("Error uploading file:", error);
        toast.error('Upload Failed: ' + error.message);
        return null;
      }
      
      // Get the public URL of the file
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);
      
      console.log("File uploaded successfully, URL:", publicUrlData.publicUrl);
      toast.success('File uploaded successfully');
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Unexpected error during file upload:", error);
      toast.error('Upload Failed: An unexpected error occurred');
      return null;
    }
  }
  
  /**
   * Creates a new course
   * @param courseData The course data
   * @param userId The ID of the user creating the course
   * @returns The created course
   */
  static async createCourse(courseData: CourseFormData, userId: string) {
    try {
      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (courseData.thumbnail && courseData.thumbnail instanceof File && courseData.thumbnail.size > 0) {
        thumbnailUrl = await CourseCreationService.uploadFile(courseData.thumbnail, 'thumbnails');
      }
      
      // Make sure difficulty_level is one of the accepted values
      const validDifficultyLevels = ['beginner', 'intermediate', 'advanced'];
      if (!validDifficultyLevels.includes(courseData.difficulty_level)) {
        throw new Error(`Invalid difficulty level: ${courseData.difficulty_level}. Must be one of: ${validDifficultyLevels.join(', ')}`);
      }
      
      console.log("Creating course with data:", {
        ...courseData,
        thumbnail: thumbnailUrl,
        creator_id: userId
      });
      
      // Create course record
      const { data, error } = await supabase.from('courses')
        .insert({
          title: courseData.title,
          description: courseData.description,
          difficulty_level: courseData.difficulty_level,
          category_id: courseData.category_id,
          course_time: courseData.course_time,
          price: courseData.price,
          thumbnail: thumbnailUrl,
          creator_id: userId
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating course:', error);
        toast("Error", {
          description: `Failed to create course: ${error.message}`,
        });
        throw error;
      }
      
      console.log("Course created successfully:", data);
      return data;
    } catch (error) {
      console.error('Course creation failed:', error);
      toast("Error", {
        description: error instanceof Error ? error.message : 'Failed to create course. Please try again.',
      });
      throw error;
    }
  }
  
  /**
   * Adds a chapter to a course
   * @param chapterData The chapter data
   * @param courseId The ID of the course
   * @returns The created chapter
   */
  static async addChapter(chapterData: ChapterFormData, courseId: number) {
    try {
      // Upload video if provided
      let videoUrl = null;
      if (chapterData.video_file && chapterData.video_file instanceof File && chapterData.video_file.size > 0) {
        videoUrl = await CourseCreationService.uploadFile(chapterData.video_file, 'videos');
      }
      
      console.log("Adding chapter with data:", {
        ...chapterData,
        video_link: videoUrl,
        course_id: courseId
      });
      
      // Create chapter record - now with title field
      const { data, error } = await supabase.from('chapters').insert({
        title: chapterData.title,
        chapter_text: chapterData.chapter_text,
        progress_when_finished: chapterData.progress_when_finished,
        video_link: videoUrl,
        course_id: courseId
      }).select().single();
      
      if (error) {
        console.error('Error adding chapter:', error);
        toast("Error", {
          description: `Failed to add chapter: ${error.message}`,
        });
        throw error;
      }
      
      console.log("Chapter added successfully:", data);
      return data;
    } catch (error) {
      console.error('Chapter creation failed:', error);
      toast("Error", {
        description: error instanceof Error ? error.message : 'Failed to add chapter. Please try again.',
      });
      throw error;
    }
  }
  
  /**
   * Gets all categories
   * @returns List of categories
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      
      if (error) {
        console.error('Error fetching categories:', error);
        toast("Error", {
          description: 'Failed to fetch categories. Please try again.',
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast("Error", {
        description: 'Failed to fetch categories. Please try again.',
      });
      return [];
    }
  }

  /**
   * Gets courses created by a user
   * @param userId The ID of the user
   * @returns List of courses created by the user
   */
  static async getCreatedCourses(userId: string) {
    try {
      const { data, error } = await supabase.from('courses')
        .select('*, categories(name)')
        .eq('creator_id', userId);
      
      if (error) {
        console.error('Error fetching created courses:', error);
        toast("Error", {
          description: 'Failed to fetch your created courses. Please try again.',
        });
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching created courses:', error);
      toast("Error", {
        description: 'Failed to fetch your created courses. Please try again.',
      });
      return [];
    }
  }

  /**
   * Updates an existing course
   * @param courseId The ID of the course to update
   * @param courseData The updated course data
   * @returns The updated course
   */
  static async updateCourse(courseId: number, courseData: Partial<CourseFormData>) {
    try {
      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (courseData.thumbnail && courseData.thumbnail instanceof File && courseData.thumbnail.size > 0) {
        thumbnailUrl = await CourseCreationService.uploadFile(courseData.thumbnail, 'thumbnails');
      }
      
      // Prepare update data
      const updateData: any = { ...courseData };
      if (thumbnailUrl) {
        updateData.thumbnail = thumbnailUrl;
      }
      
      // Remove thumbnail from update data if it's a File object
      if (updateData.thumbnail instanceof File) {
        delete updateData.thumbnail;
      }
      
      // Update course record
      const { data, error } = await supabase.from('courses')
        .update(updateData)
        .eq('id', courseId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating course:', error);
        toast("Error", {
          description: `Failed to update course: ${error.message}`,
        });
        throw error;
      }
      
      toast.success('Course updated successfully');
      return data;
    } catch (error) {
      console.error('Course update failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update course');
      throw error;
    }
  }

  /**
   * Gets chapters for a course
   * @param courseId The ID of the course
   * @returns List of chapters for the course
   */
  static async getCourseChapters(courseId: number) {
    try {
      const { data, error } = await supabase.from('chapters')
        .select('*')
        .eq('course_id', courseId)
        .order('id', { ascending: true });
      
      if (error) {
        console.error('Error fetching chapters:', error);
        toast("Error", {
          description: 'Failed to fetch chapters. Please try again.',
        });
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast("Error", {
        description: 'Failed to fetch chapters. Please try again.',
      });
      return [];
    }
  }

  /**
   * Updates an existing chapter
   * @param chapterId The ID of the chapter to update
   * @param chapterData The updated chapter data
   * @returns The updated chapter
   */
  static async updateChapter(chapterId: number, chapterData: Partial<ChapterFormData>) {
    try {
      // Upload video if provided
      let videoUrl = null;
      if (chapterData.video_file && chapterData.video_file instanceof File && chapterData.video_file.size > 0) {
        videoUrl = await CourseCreationService.uploadFile(chapterData.video_file, 'videos');
      }
      
      // Prepare update data
      const updateData: any = { ...chapterData };
      if (videoUrl) {
        updateData.video_link = videoUrl;
      }
      
      // Remove video_file from update data if it's a File object
      if (updateData.video_file instanceof File) {
        delete updateData.video_file;
      }
      
      // Update chapter record
      const { data, error } = await supabase.from('chapters')
        .update(updateData)
        .eq('id', chapterId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating chapter:', error);
        toast("Error", {
          description: `Failed to update chapter: ${error.message}`,
        });
        throw error;
      }
      
      toast.success('Chapter updated successfully');
      return data;
    } catch (error) {
      console.error('Chapter update failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update chapter');
      throw error;
    }
  }

  /**
   * Deletes a chapter
   * @param chapterId The ID of the chapter to delete
   */
  static async deleteChapter(chapterId: number) {
    try {
      const { error } = await supabase.from('chapters')
        .delete()
        .eq('id', chapterId);
      
      if (error) {
        console.error('Error deleting chapter:', error);
        toast("Error", {
          description: `Failed to delete chapter: ${error.message}`,
        });
        throw error;
      }
      
      toast.success('Chapter deleted successfully');
    } catch (error) {
      console.error('Chapter deletion failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete chapter');
      throw error;
    }
  }

  /**
   * Deletes a course and all its chapters
   * @param courseId The ID of the course to delete
   */
  static async deleteCourse(courseId: number) {
    try {
      // First, delete all chapters associated with the course
      const { error: chaptersError } = await supabase.from('chapters')
        .delete()
        .eq('course_id', courseId);
      
      if (chaptersError) {
        console.error('Error deleting course chapters:', chaptersError);
        toast.error(`Failed to delete course chapters: ${chaptersError.message}`);
        throw chaptersError;
      }
      
      // Then delete the course itself
      const { error } = await supabase.from('courses')
        .delete()
        .eq('id', courseId);
      
      if (error) {
        console.error('Error deleting course:', error);
        toast.error(`Failed to delete course: ${error.message}`);
        throw error;
      }
      
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error('Course deletion failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete course');
      throw error;
    }
  }
}
