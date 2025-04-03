
import { useState, useEffect, useCallback } from 'react';
import { ProfileService } from '@/services/profile/profile-service';
import { UserProfile } from '@/types/profile';

export const useFetchProfile = (userId: string | undefined) => {
  const [profileData, setProfileData] = useState<UserProfile>({
    username: '',
    bio: '',
    avatar_url: null
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  
  const fetchUserProfile = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const profile = await ProfileService.fetchUserProfile(userId);
      
      if (profile) {
        setProfileData(profile);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile hook:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId, fetchUserProfile]);
  
  return {
    profileData,
    setProfileData,
    loading,
    fetchUserProfile
  };
};
