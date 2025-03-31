
import React from 'react';
import { User, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileTabProps {
  userInterests: any[];
  handleEditInterests: () => void;
}

const ProfileTab = ({ userInterests, handleEditInterests }: ProfileTabProps) => {
  const { user } = useAuth();
  
  // Function to determine the text color based on difficulty level
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
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-700 flex items-center justify-center">
              <User size={48} className="text-gray-400" />
            </div>
            <button className="button-secondary py-2 w-full">Change Photo</button>
          </div>
          
          <div className="w-full md:w-2/3">
            <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-2">Username</label>
                <p className="p-3 rounded-lg bg-navy border border-slate-700 text-white">
                  {user?.user_metadata?.username || 'Not set'}
                </p>
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
      
      {/* Your Interests Section */}
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
