
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CourseFormData } from "./types";
import { StorageService } from "./storage-service";

export class CourseService {
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
        thumbnailUrl = await StorageService.uploadFile(courseData.thumbnail, 'thumbnails');
      }
      
      // Make sure difficulty_level is one of the accepted values
      const validDifficultyLevels = ['beginner', 'intermediate', 'advanced'];
      if (courseData.difficulty_level && !validDifficultyLevels.includes(courseData.difficulty_level)) {
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
          difficulty_level: courseData.difficulty_level || null,
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
        toast.error(`Failed to create course: ${error.message}`);
        throw error;
      }
      
      console.log("Course created successfully:", data);
      return data;
    } catch (error) {
      console.error('Course creation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create course. Please try again.');
      throw error;
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
        toast.error('Failed to fetch your created courses. Please try again.');
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching created courses:', error);
      toast.error('Failed to fetch your created courses. Please try again.');
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
        thumbnailUrl = await StorageService.uploadFile(courseData.thumbnail, 'thumbnails');
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
        toast.error(`Failed to update course: ${error.message}`);
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
