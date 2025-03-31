
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileFormProps {
  isEditing: boolean;
  loading: boolean;
  profileData: {
    username: string;
    bio: string;
  };
  onProfileDataChange: (data: { username: string, bio: string }) => void;
  onCancel: () => void;
  onSave: () => void;
}

const ProfileForm = ({ 
  isEditing, 
  loading, 
  profileData,
  onProfileDataChange,
  onCancel,
  onSave
}: ProfileFormProps) => {
  const { user } = useAuth();
  
  return (
    <div className="w-full md:w-2/3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Profile Information</h2>
        {isEditing && (
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={onSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
      
      <div className="space-y-4">              
        <div>
          <label className="block text-slate-400 mb-2">Username</label>
          {isEditing ? (
            <Input
              value={profileData.username}
              onChange={(e) => onProfileDataChange({
                ...profileData, 
                username: e.target.value
              })}
              placeholder="Enter your username"
              className="bg-navy border border-slate-700 text-white"
            />
          ) : (
            <p className="p-3 rounded-lg bg-navy border border-slate-700 text-white">
              {profileData.username || 'Not set'}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-slate-400 mb-2">Bio</label>
          {isEditing ? (
            <Textarea
              value={profileData.bio}
              onChange={(e) => onProfileDataChange({
                ...profileData, 
                bio: e.target.value
              })}
              placeholder="Tell us about yourself"
              className="bg-navy border border-slate-700 text-white min-h-[100px]"
            />
          ) : (
            <p className="p-3 rounded-lg bg-navy border border-slate-700 text-white">
              {profileData.bio || 'No bio provided'}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-slate-400 mb-2">Email</label>
          <p className="p-3 rounded-lg bg-navy border border-slate-700 text-white">
            {user?.email}
          </p>
        </div>
        
        <div>
          <label className="block text-slate-400 mb-2">Account Created</label>
          <p className="p-3 rounded-lg bg-navy border border-slate-700 text-white">
            {new Date(user?.created_at || Date.now()).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
