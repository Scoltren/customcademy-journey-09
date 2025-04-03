
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFetchProfile } from '@/hooks/profile/useFetchProfile';
import { useProfileUpdate } from '@/hooks/profile/useProfileUpdate';
import { UserProfile } from '@/types/profile';

export { UserProfile };

export const useProfileData = () => {
  const { user } = useAuth();
  
  const {
    profileData,
    setProfileData,
    loading: fetchLoading,
    fetchUserProfile
  } = useFetchProfile(user?.id);
  
  const {
    isEditing,
    setIsEditing,
    loading: updateLoading,
    profilePicture,
    setProfilePicture,
    handleSaveProfile
  } = useProfileUpdate(fetchUserProfile);
  
  // Combine loading states
  const loading = fetchLoading || updateLoading;
  
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
