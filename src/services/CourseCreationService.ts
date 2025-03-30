
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const CourseCreationService = {
  uploadFile: async (file: File, bucket: string, folder: string) => {
    try {
      // We'll use course-media bucket for all media uploads
      const BUCKET_NAME = 'course-media';
      
      // Verify the bucket exists before attempting upload
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        throw bucketsError;
      }
      
      const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
      if (!bucketExists) {
        console.error(`Bucket ${BUCKET_NAME} does not exist`);
        throw new Error(`Bucket ${BUCKET_NAME} does not exist`);
      }
      
      console.log(`Uploading to ${BUCKET_NAME}/${folder}`);
      const fileExt = file.name.split('.').pop();
      const filePath = `${folder}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }
      
      const { data } = supabase
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
        
      console.log('File uploaded successfully, URL:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload file. Please try again.');
      throw error;
    }
  },
  
  createCourse: async (courseData: CourseFormData, creatorId: string) => {
    try {
      let thumbnailUrl = null;
      
      // Upload thumbnail if exists
      if (courseData.thumbnail) {
        thumbnailUrl = await CourseCreationService.uploadFile(
          courseData.thumbnail, 
          'course-media', // Use course-media bucket
          'thumbnails'
        );
      }
      
      // Insert course into database
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseData.title,
          description: courseData.description,
          difficulty_level: courseData.difficulty_level,
          category_id: courseData.category_id,
          course_time: courseData.course_time,
          price: courseData.price,
          thumbnail: thumbnailUrl,
          creator_id: creatorId
        })
        .select()
        .single();
      
      if (courseError) {
        console.error('Error creating course:', courseError);
        throw courseError;
      }
      
      return course;
    } catch (error) {
      console.error('Course creation error:', error);
      toast.error('Failed to create course. Please try again.');
      throw error;
    }
  },
  
  addChapter: async (chapterData: ChapterFormData, courseId: number) => {
    try {
      let videoUrl = null;
      
      // Upload video if exists
      if (chapterData.video_file) {
        videoUrl = await CourseCreationService.uploadFile(
          chapterData.video_file, 
          'course-media', // Use course-media bucket
          'videos'
        );
      }
      
      // Insert chapter into database
      const { data: chapter, error: chapterError } = await supabase
        .from('chapters')
        .insert({
          title: chapterData.title,
          chapter_text: chapterData.chapter_text,
          progress_when_finished: chapterData.progress_when_finished,
          video_link: videoUrl,
          course_id: courseId
        })
        .select()
        .single();
      
      if (chapterError) {
        console.error('Error creating chapter:', chapterError);
        throw chapterError;
      }
      
      return chapter;
    } catch (error) {
      console.error('Chapter creation error:', error);
      toast.error('Failed to create chapter. Please try again.');
      throw error;
    }
  },
  
  getCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
        
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Categories fetch error:', error);
      toast.error('Failed to load categories. Please refresh the page.');
      throw error;
    }
  }
};

export default CourseCreationService;
