
import React from 'react';
import ProfileHeader from '../profile/ProfileHeader';
import ProfileForm from '../profile/ProfileForm';
import ProfilePictureUploader from '../profile/ProfilePictureUploader';
import UserInterestsDisplay from '../profile/UserInterestsDisplay';
import { useProfileData } from '../profile/useProfileData';

interface ProfileTabProps {
  userInterests: any[];
  handleEditInterests: () => void;
}

/**
 * Profile tab component for the user dashboard
 * Displays and allows editing of user profile information
 */
const ProfileTab = ({ userInterests, handleEditInterests }: ProfileTabProps) => {
  // Use custom hook to manage profile data and interactions
  const {
    profileData, 
    setProfileData,
    isEditing,
    setIsEditing,
    loading,
    setProfilePicture,
    handleSaveProfile,
    fetchUserProfile
  } = useProfileData();
  
  return (
    <div>
      {/* Profile header with title */}
      <ProfileHeader title="Profile" />
      
      {/* Profile information card with picture and form */}
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile picture upload component */}
          <ProfilePictureUploader 
            avatarUrl={profileData.avatar_url}
            isEditing={isEditing}
            onFileSelect={setProfilePicture}
            onEdit={() => setIsEditing(true)}
          />
          
          {/* Profile information form */}
          <ProfileForm 
            isEditing={isEditing}
            loading={loading}
            profileData={profileData}
            onProfileDataChange={setProfileData}
            onCancel={() => {
              setIsEditing(false);
              fetchUserProfile(); // Reset form
            }}
            onSave={() => handleSaveProfile(profileData)} // Pass profileData to handleSaveProfile
          />
        </div>
      </div>
      
      {/* Display of user's selected interest categories */}
      <UserInterestsDisplay 
        userInterests={userInterests} 
        handleEditInterests={handleEditInterests} 
      />
    </div>
  );
};

export default ProfileTab;
