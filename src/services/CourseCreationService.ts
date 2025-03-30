
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
      // Check if the bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error("Error checking buckets:", bucketError);
        toast({
          title: "Error",
          description: "Failed to check storage buckets",
          variant: "destructive",
        });
        return null;
      }
      
      // Match by bucket ID
      const bucketExists = buckets.some(b => b.id === BUCKET_NAME);
      
      if (!bucketExists) {
        console.error(`Bucket ${BUCKET_NAME} does not exist in Supabase storage`);
        toast({
          title: "Storage Error",
          description: `Required storage bucket not found. Please contact support.`,
          variant: "destructive",
        });
        return null;
      }
      
      // Generate a unique file name to avoid collisions
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      const filePath = path ? `${path}/${fileName}` : fileName;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error("Error uploading file:", error);
        toast({
          title: "Upload Failed",
          description: error.message || "Failed to upload file. Please try again.",
          variant: "destructive",
        });
        return null;
      }
      
      // Get the public URL of the file since the bucket is public
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);
      
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Unexpected error during file upload:", error);
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
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
      if (courseData.thumbnail) {
        thumbnailUrl = await CourseCreationService.uploadFile(courseData.thumbnail, 'thumbnails');
        if (!thumbnailUrl) {
          throw new Error("Failed to upload thumbnail");
        }
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
        toast({
          title: 'Error',
          description: 'Failed to create course. Please try again.',
          variant: 'destructive',
        });
        throw error;
      }
      
      console.log("Course created successfully:", data);
      return data;
    } catch (error) {
      console.error('Course creation failed:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create course. Please try again.',
        variant: 'destructive',
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
    // Upload video if provided
    let videoUrl = null;
    if (chapterData.video_file) {
      videoUrl = await CourseCreationService.uploadFile(chapterData.video_file, 'videos');
    }
    
    // Create chapter record
    const { data, error } = await supabase.from('chapters').insert({
      title: chapterData.title,
      chapter_text: chapterData.chapter_text,
      progress_when_finished: chapterData.progress_when_finished,
      video_link: videoUrl,
      course_id: courseId
    }).select().single();
    
    if (error) {
      console.error('Error adding chapter:', error);
      toast({
        title: 'Error',
        description: 'Failed to add chapter. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
    
    return data;
  }
  
  /**
   * Gets all categories
   * @returns List of categories
   */
  static async getCategories() {
    const { data, error } = await supabase.from('categories').select('*');
    
    if (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch categories. Please try again.',
        variant: 'destructive',
      });
      return [];
    }
    
    return data;
  }
}
