
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProfilePictureUploadResult {
  url: string | null;
  error: Error | null;
}

export class ProfilePictureService {
  /**
   * Uploads a profile picture to Supabase storage
   * @param file The image file to upload
   * @returns Object containing the URL of the uploaded file or an error
   */
  static async uploadProfilePicture(file: File): Promise<ProfilePictureUploadResult> {
    try {
      if (!file) {
        return { url: null, error: new Error("No file provided") };
      }
      
      const bucketName = 'profile-pictures';
      const filePath = `${Date.now()}_${file.name}`;
      
      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Profile picture upload error:', uploadError);
        return { url: null, error: uploadError };
      }
      
      // Get the public URL of the file
      const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      console.log('Profile picture uploaded successfully:', publicData.publicUrl);
      return { url: publicData.publicUrl, error: null };
    } catch (error) {
      console.error("Unexpected error during profile picture upload:", error);
      return { url: null, error: error as Error };
    }
  }

  /**
   * Attempts to delete a profile picture from Supabase storage
   * @param url The URL of the profile picture to delete
   */
  static async deleteProfilePicture(url: string | null): Promise<boolean> {
    if (!url) return true;
    
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const filePath = pathParts[pathParts.length - 1];
      
      if (!filePath) {
        console.log("Could not extract file path from URL:", url);
        return false;
      }
      
      const bucketName = 'profile-pictures';
      
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
      
      if (error) {
        console.error("Error deleting profile picture:", error);
        return false;
      }
      
      console.log("Successfully deleted profile picture");
      return true;
    } catch (error) {
      console.error("Error in deleteProfilePicture:", error);
      return false;
    }
  }
}
