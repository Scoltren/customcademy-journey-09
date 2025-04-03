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
      console.log("Starting course creation with data:", { ...courseData, thumbnail: courseData.thumbnail ? "File present" : "No file" });
      
      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (courseData.thumbnail && courseData.thumbnail instanceof File && courseData.thumbnail.size > 0) {
        console.log("Uploading thumbnail:", {
          name: courseData.thumbnail.name,
          size: courseData.thumbnail.size,
          type: courseData.thumbnail.type
        });
        
        // Pass explicit folder name and use the default bucket name
        thumbnailUrl = await StorageService.uploadFile(courseData.thumbnail, "thumbnails");
        console.log("Thumbnail upload result URL:", thumbnailUrl);
      }
      
      // Make sure difficulty_level is one of the accepted values or null
      const validDifficultyLevels = ['beginner', 'intermediate', 'advanced', null];
      if (courseData.difficulty_level !== null && !validDifficultyLevels.includes(courseData.difficulty_level as any)) {
        throw new Error(`Invalid difficulty level: ${courseData.difficulty_level}. Must be one of: beginner, intermediate, advanced, or null`);
      }
      
      console.log("Creating course with processed data:", {
        ...courseData,
        thumbnail: thumbnailUrl,
        creator_id: userId,
        difficulty_level: courseData.difficulty_level
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
        toast.error(`Failed to create course: ${error.message}`);
        throw error;
      }
      
      console.log("Course created successfully:", data);
      return data;
    } catch (error) {
      console.error('Course creation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create course');
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
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching created courses:', error);
        toast.error('Failed to load your created courses');
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching created courses:', error);
      toast.error('Failed to load your created courses');
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
        .update({
          title: updateData.title,
          description: updateData.description,
          difficulty_level: updateData.difficulty_level,
          category_id: updateData.category_id,
          course_time: updateData.course_time,
          price: updateData.price,
          thumbnail: updateData.thumbnail,
        })
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
   * Deletes a course
   * @param courseId The ID of the course to delete
   */
  static async deleteCourse(courseId: number) {
    try {
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
