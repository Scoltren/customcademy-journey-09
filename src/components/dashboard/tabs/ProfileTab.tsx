import React, { useState, useEffect, useRef } from 'react';
import { User, Edit, Upload, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/course-creation/FileUploader';
import { StorageService } from '@/services/course-creation/storage-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface ProfileTabProps {
  userInterests: any[];
  handleEditInterests: () => void;
}

interface UserProfile {
  username: string;
  bio: string;
  avatar_url: string | null;
}

const ProfileTab = ({ userInterests, handleEditInterests }: ProfileTabProps) => {
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
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let avatar_url = profileData.avatar_url;
      
      // Upload profile picture if selected
      if (profilePicture) {
        avatar_url = await StorageService.uploadFile(profilePicture, 'avatars', 'profile-pictures');
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
  
  const getDifficultyColor = (level: string | undefined) => {
    switch(level) {
      case 'Beginner':
        return 'text-green-400';
      case 'Intermediate':
        return 'text-yellow-400';
      case 'Advanced':
        return 'text-red-400';
      default:
        return 'text-xs opacity-70';
    }
  };
  
  return (
    <div>
      <h1 className="heading-lg mb-6">Profile</h1>
      
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/3 flex flex-col items-center">
            {isEditing ? (
              <div className="mb-4 w-full">
                <FileUploader
                  accept="image/*"
                  onChange={setProfilePicture}
                  maxSize={5 * 1024 * 1024} // 5MB max
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-700 flex items-center justify-center">
                {profileData.avatar_url ? (
                  <Avatar className="w-full h-full">
                    <AvatarImage src={profileData.avatar_url} alt="Profile picture" />
                    <AvatarFallback>
                      <User size={48} className="text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User size={48} className="text-gray-400" />
                )}
              </div>
            )}
            
            {!isEditing && (
              <Button 
                variant="secondary" 
                className="py-2 w-full"
                onClick={() => setIsEditing(true)}
              >
                <Edit size={16} className="mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
          
          <div className="w-full md:w-2/3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Profile Information</h2>
              {isEditing && (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      fetchUserProfile(); // Reset form
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveProfile}
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
                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
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
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
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
        </div>
      </div>
      
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Your Interests</h2>
          <button 
            onClick={handleEditInterests}
            className="text-blue-light hover:text-blue-400 flex items-center gap-1"
          >
            <Edit size={14} className="mr-1" />
            Edit your interests
          </button>
        </div>
        
        {userInterests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {userInterests.map((interest) => (
              <div 
                key={interest.category_id} 
                className="py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20 text-sm"
              >
                <span>{interest.category?.name || 'Unknown'}</span>
                {interest.difficulty_level ? (
                  <span className={`ml-1 ${getDifficultyColor(interest.difficulty_level)}`}>
                    • {interest.difficulty_level}
                  </span>
                ) : (
                  <span className="ml-1 text-xs opacity-70">
                    • No level assigned
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-400">
            <p>You haven't selected any interests yet.</p>
            <button 
              onClick={handleEditInterests}
              className="mt-2 px-4 py-1.5 bg-blue text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
            >
              Select Interests
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTab;
