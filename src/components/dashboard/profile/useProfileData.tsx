
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StorageService } from '@/services/course-creation/storage-service';
import { toast } from 'sonner';

export interface UserProfile {
  username: string;
  bio: string;
  avatar_url: string | null;
}

export const useProfileData = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile>({
    username: user?.user_metadata?.username || '',
    bio: '',
    avatar_url: null
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);
  
  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, bio, profile_picture')
        .eq('auth_user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data) {
        setProfileData({
          username: data.username || user?.user_metadata?.username || '',
          bio: data.bio || '',
          avatar_url: data.profile_picture || null
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };
  
  const deleteOldProfilePicture = async (oldUrl: string | null) => {
    if (!oldUrl) return;
    
    try {
      // Extract file path from the URL
      const urlObj = new URL(oldUrl);
      const pathWithBucket = urlObj.pathname.split('/public/')[1];
      
      if (!pathWithBucket) {
        console.log("Could not extract file path from URL:", oldUrl);
        return;
      }
      
      // Split into bucket and file path
      const [bucket, ...pathParts] = pathWithBucket.split('/');
      const filePath = pathParts.join('/');
      
      if (!bucket || !filePath) {
        console.log("Invalid file path components:", { bucket, filePath });
        return;
      }
      
      console.log(`Attempting to delete file from bucket: ${bucket}, path: ${filePath}`);
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);
      
      if (error) {
        console.error("Error deleting old profile picture:", error);
      } else {
        console.log("Successfully deleted old profile picture");
      }
    } catch (error) {
      console.error("Error in deleteOldProfilePicture:", error);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let avatar_url = profileData.avatar_url;
      
      // Upload profile picture if selected
      if (profilePicture) {
        console.log("Uploading profile picture:", profilePicture.name, profilePicture.type, profilePicture.size);
        
        // Delete old profile picture before uploading a new one
        if (profileData.avatar_url) {
          await deleteOldProfilePicture(profileData.avatar_url);
        }
        
        avatar_url = await StorageService.uploadFile(profilePicture, 'avatars', 'profile-pictures');
        console.log("Profile picture upload result:", avatar_url);
      }
      
      // Update user record in the database
      const { error: dbError } = await supabase
        .from('users')
        .update({
          username: profileData.username,
          bio: profileData.bio,
          profile_picture: avatar_url
        })
        .eq('auth_user_id', user.id);
      
      if (dbError) throw dbError;
      
      // Update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { username: profileData.username }
      });
      
      if (authError) throw authError;
      
      // Update local state with new avatar url
      setProfileData(prev => ({
        ...prev,
        avatar_url: avatar_url
      }));
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
      setProfilePicture(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return {
    profileData,
    setProfileData,
    isEditing,
    setIsEditing,
    loading,
    profilePicture,
    setProfilePicture,
    handleSaveProfile,
    fetchUserProfile
  };
};
