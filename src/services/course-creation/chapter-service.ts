import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChapterFormData } from "./types";
import { StorageService } from "./storage-service";

export class ChapterService {
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
        console.log("Uploading video file:", {
          name: chapterData.video_file.name,
          size: chapterData.video_file.size,
          type: chapterData.video_file.type
        });
        
        // Upload to the "videos" folder in the course-media bucket
        videoUrl = await StorageService.uploadFile(chapterData.video_file, "videos", "course-media");
        console.log("Video upload result URL:", videoUrl);
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
        toast.error(`Failed to add chapter: ${error.message}`);
        throw error;
      }
      
      console.log("Chapter added successfully:", data);
      return data;
    } catch (error) {
      console.error('Chapter creation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add chapter. Please try again.');
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
        toast.error('Failed to fetch chapters. Please try again.');
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast.error('Failed to fetch chapters. Please try again.');
      return [];
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
        toast.error(`Failed to delete chapter: ${error.message}`);
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
        // Upload to the "videos" folder in the course-media bucket
        videoUrl = await StorageService.uploadFile(chapterData.video_file, "videos", "course-media");
        console.log("Updated video URL:", videoUrl);
      }
      
      // Prepare update data - IMPORTANT: Remove video_file field as it doesn't exist in the database
      const updateData: Record<string, any> = {
        title: chapterData.title,
        chapter_text: chapterData.chapter_text,
        progress_when_finished: chapterData.progress_when_finished
      };
      
      // Only add video_link if we have a new video URL
      if (videoUrl) {
        updateData.video_link = videoUrl;
      }
      
      console.log("Updating chapter with data:", updateData);
      
      // Update chapter record
      const { data, error } = await supabase.from('chapters')
        .update(updateData)
        .eq('id', chapterId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating chapter:', error);
        toast.error(`Failed to update chapter: ${error.message}`);
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
}
