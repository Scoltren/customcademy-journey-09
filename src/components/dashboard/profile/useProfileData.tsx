
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
        
        // Direct upload implementation using the reference code provided
        const fileExtension = profilePicture.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
        const filePath = `avatars/${fileName}`;
        const bucketName = 'profile-pictures';
        
        // Check if bucket exists
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          console.error("Error checking storage buckets:", bucketsError);
          toast.error("Upload failed: couldn't access storage");
          throw new Error("Couldn't access storage buckets");
        }
        
        // Log available buckets for debugging
        console.log("Available buckets:", buckets.map(b => b.name));
        
        // Check if our target bucket exists
        const bucketExists = buckets.some(b => b.name === bucketName);
        
        if (!bucketExists) {
          console.error(`Bucket '${bucketName}' does not exist`);
          toast.error(`Upload failed: storage location '${bucketName}' not found. Available buckets: ${buckets.map(b => b.name).join(', ')}`);
          throw new Error(`Bucket '${bucketName}' not found`);
        }
        
        // Upload the file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from(bucketName)
          .upload(filePath, profilePicture, {
            contentType: profilePicture.type,
            cacheControl: '3600',
            upsert: true
          });
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Failed to upload profile picture: ' + uploadError.message);
          throw uploadError;
        }
        
        // Retrieve the public URL for the uploaded file
        const { data: publicData } = supabase
          .storage
          .from(bucketName)
          .getPublicUrl(filePath);
        
        avatar_url = publicData.publicUrl;
        console.log('Profile picture URL:', avatar_url);
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
