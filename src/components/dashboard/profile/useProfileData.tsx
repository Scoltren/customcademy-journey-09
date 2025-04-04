
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFetchProfile } from '@/hooks/profile/useFetchProfile';
import { useProfileUpdate } from '@/hooks/profile/useProfileUpdate';
import { UserProfile } from '@/types/profile';

// Re-export UserProfile type
export type { UserProfile };

/**
 * Custom hook to manage user profile data, including fetching and updating
 */
export const useProfileData = () => {
  // Get current user from auth context
  const { user } = useAuth();
  
  // Hook for fetching profile data
  const {
    profileData,
    setProfileData,
    loading: fetchLoading,
    fetchUserProfile
  } = useFetchProfile(user?.id);
  
  // Hook for updating profile data
  const {
    isEditing,
    setIsEditing,
    loading: updateLoading,
    profilePicture,
    setProfilePicture,
    handleSaveProfile
  } = useProfileUpdate(fetchUserProfile);
  
  // Combine loading states from both hooks
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
