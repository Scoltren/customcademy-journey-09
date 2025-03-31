
import React, { useState } from 'react';
import { User } from 'lucide-react';
import { FileUploader } from '@/components/course-creation/FileUploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface ProfilePictureUploaderProps {
  avatarUrl: string | null;
  isEditing: boolean;
  onFileSelect: (file: File | null) => void;
  onEdit?: () => void;
}

const ProfilePictureUploader = ({ 
  avatarUrl, 
  isEditing, 
  onFileSelect,
  onEdit
}: ProfilePictureUploaderProps) => {
  return (
    <div className="w-full md:w-1/3 flex flex-col items-center">
      {isEditing ? (
        <div className="mb-4 w-full">
          <FileUploader
            accept="image/*"
            onChange={(file) => {
              console.log("File selected:", file?.name);
              onFileSelect(file);
            }}
            maxSize={5 * 1024 * 1024} // 5MB max
          />
        </div>
      ) : (
        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-700 flex items-center justify-center">
          {avatarUrl ? (
            <Avatar className="w-full h-full">
              <AvatarImage 
                src={avatarUrl} 
                alt="Profile picture" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Error loading profile picture:", e);
                  (e.target as HTMLImageElement).src = '';
                }}
              />
              <AvatarFallback>
                <User size={48} className="text-gray-400" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <User size={48} className="text-gray-400" />
          )}
        </div>
      )}
      
      {!isEditing && onEdit && (
        <Button 
          variant="secondary" 
          className="py-2 w-full"
          onClick={onEdit}
        >
          <User size={16} className="mr-2" />
          Edit Profile
        </Button>
      )}
    </div>
  );
};

export default ProfilePictureUploader;
