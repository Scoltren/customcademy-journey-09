
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BUCKET_NAME } from "./types";

export class StorageService {
  /**
   * Uploads a file to Supabase storage
   * @param file The file to upload
   * @param path Optional path within the bucket
   * @param bucket The storage bucket name, defaults to BUCKET_NAME
   * @returns URL of the uploaded file or null if upload failed
   */
  static async uploadFile(file: File, path?: string, bucket: string = BUCKET_NAME): Promise<string | null> {
    try {
      if (!file) {
        console.log("No file provided for upload");
        return null;
      }
      
      // Generate a unique file name to avoid collisions
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      const filePath = path ? `${path}/${fileName}` : fileName;
      
      // Debugging: Log the bucket name and file details
      console.log(`Attempting to upload file to bucket: ${bucket}`, {
        fileName,
        filePath,
        fileType: file.type,
        fileSize: file.size
      });
      
      // Upload the file directly without checking bucket existence
      // This simplifies the process and relies on proper error handling
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error("Error uploading file:", error);
        
        // Provide more specific error messages
        if (error.message.includes("does not exist")) {
          toast.error(`Upload failed: The bucket '${bucket}' doesn't exist. Please contact support.`);
        } else {
          toast.error('Upload Failed: ' + error.message);
        }
        return null;
      }
      
      // Get the public URL of the file
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
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
}
