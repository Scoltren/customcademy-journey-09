
import { useState } from 'react';
import { ProfileService } from '@/services/profile/profile-service';
import { UserProfile } from '@/types/profile';
import { useAuth } from '@/contexts/AuthContext';

export const useProfileUpdate = (fetchUserProfile: () => Promise<void>) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  
  const handleSaveProfile = async (profileData: UserProfile) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const success = await ProfileService.updateUserProfile(
        user.id,
        profileData,
        profilePicture
      );
      
      if (success) {
        setIsEditing(false);
        setProfilePicture(null);
        await fetchUserProfile();
      }
    } finally {
      setLoading(false);
    }
  };
  
  return {
    isEditing,
    setIsEditing,
    loading,
    profilePicture,
    setProfilePicture,
    handleSaveProfile
  };
};
