
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
 * Profile tab component for the dashboard
 */
const ProfileTab = ({ userInterests, handleEditInterests }: ProfileTabProps) => {
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
      <ProfileHeader title="Profile" />
      
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <ProfilePictureUploader 
            avatarUrl={profileData.avatar_url}
            isEditing={isEditing}
            onFileSelect={setProfilePicture}
            onEdit={() => setIsEditing(true)}
          />
          
          <ProfileForm 
            isEditing={isEditing}
            loading={loading}
            profileData={profileData}
            onProfileDataChange={setProfileData}
            onCancel={() => {
              setIsEditing(false);
              fetchUserProfile(); // Reset form
            }}
            onSave={() => handleSaveProfile(profileData)} // Fix: Pass profileData to handleSaveProfile
          />
        </div>
      </div>
      
      <UserInterestsDisplay 
        userInterests={userInterests} 
        handleEditInterests={handleEditInterests} 
      />
    </div>
  );
};

export default ProfileTab;
