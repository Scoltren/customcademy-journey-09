
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile } from "@/types/profile";
import { ProfilePictureService } from "./profile-picture-service";

export class ProfileService {
  /**
   * Fetches a user's profile data from Supabase
   * @param userId The ID of the user to fetch
   * @returns The user's profile data or null if not found
   */
  static async fetchUserProfile(userId: string | undefined): Promise<UserProfile | null> {
    try {
      if (!userId) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('username, bio, profile_picture')
        .eq('auth_user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      if (data) {
        return {
          username: data.username || '',
          bio: data.bio || '',
          avatar_url: data.profile_picture || null
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }

  /**
   * Updates a user's profile in Supabase
   * @param userId The ID of the user to update
   * @param profileData The profile data to update
   * @param profilePicture Optional new profile picture to upload
   * @returns Whether the update was successful
   */
  static async updateUserProfile(
    userId: string, 
    profileData: UserProfile, 
    profilePicture: File | null
  ): Promise<boolean> {
    try {
      let avatarUrl = profileData.avatar_url;
      
      if (profilePicture) {
        console.log("Uploading profile picture:", profilePicture.name);
        
        if (profileData.avatar_url) {
          await ProfilePictureService.deleteProfilePicture(profileData.avatar_url);
        }
        
        const uploadResult = await ProfilePictureService.uploadProfilePicture(profilePicture);
        
        if (uploadResult.error) {
          toast.error('Failed to upload profile picture: ' + uploadResult.error.message);
          return false;
        }
        
        avatarUrl = uploadResult.url;
        console.log('New profile picture URL:', avatarUrl);
      }
      
      const { error: dbError } = await supabase
        .from('users')
        .update({
          username: profileData.username,
          bio: profileData.bio,
          profile_picture: avatarUrl
        })
        .eq('auth_user_id', userId);
      
      if (dbError) {
        console.error('Error updating user profile:', dbError);
        toast.error('Failed to update profile: ' + dbError.message);
        return false;
      }
      
      const { error: authError } = await supabase.auth.updateUser({
        data: { username: profileData.username }
      });
      
      if (authError) {
        console.error('Error updating auth user:', authError);
        toast.error('Failed to update authentication data: ' + authError.message);
        return false;
      }
      
      toast.success('Profile updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error in updateUserProfile:', error);
      toast.error('Failed to update profile: ' + error.message);
      return false;
    }
  }
}
