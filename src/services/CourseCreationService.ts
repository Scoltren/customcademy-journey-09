
import { supabaseClient } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Constants
const BUCKET_NAME = "course-media";

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
      const { data: buckets, error: bucketError } = await supabaseClient.storage.listBuckets();
      
      if (bucketError) {
        console.error("Error checking buckets:", bucketError);
        toast({
          title: "Error",
          description: "Failed to check storage buckets",
          variant: "destructive",
        });
        return null;
      }
      
      // Changed from b.name to b.id as per requirement
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
      const { data, error } = await supabaseClient.storage
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
      
      // Get the public URL of the file
      const { data: publicUrl } = supabaseClient.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);
      
      return publicUrl.publicUrl;
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
}

