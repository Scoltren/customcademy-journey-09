
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserInterest } from '@/types/interest';

interface UserInterestsSectionProps {
  userId: string;
}

const UserInterestsSection: React.FC<UserInterestsSectionProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(false);

  useEffect(() => {
    fetchUserInterests();
  }, [userId]);

  const fetchUserInterests = async () => {
    try {
      setLoadingInterests(true);
      const { data, error } = await supabase
        .from('user_interest_categories')
        .select('*, category:categories(*)')
        .eq('user_id', userId);

      if (error) throw error;
      setUserInterests(data || []);
    } catch (error: any) {
      console.error('Error fetching user interests:', error.message);
      toast.error('Failed to load your interests');
    } finally {
      setLoadingInterests(false);
    }
  };

  // Function to determine the text color based on difficulty level
  const getDifficultyColor = (level: string | undefined) => {
    switch(level) {
      case 'Beginner':
        return 'text-green-500';
      case 'Intermediate':
        return 'text-yellow-500';
      case 'Advanced':
        return 'text-red-500';
      default:
        return 'text-xs opacity-70';
    }
  };

  // Function to get the appropriate background color for interest tags
  const getTagBackgroundColor = (level: string | undefined) => {
    switch(level) {
      case 'Beginner':
        return 'bg-green-500/10 border-green-500/20';
      case 'Intermediate':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'Advanced':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-blue/10 border-blue/20';
    }
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Your Interests</h2>
        <Button 
          onClick={() => navigate('/select-interests')}
          variant="outline"
        >
          Edit your interests
        </Button>
      </div>
      
      {loadingInterests ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : userInterests.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {userInterests.map((interest) => (
            <div 
              key={interest.category_id} 
              className={`py-1 px-3 rounded-full text-blue-light border ${getTagBackgroundColor(interest.difficulty_level)} text-sm`}
            >
              <span>{interest.category?.name}</span>
              {interest.difficulty_level ? (
                <span className={`ml-1 font-medium ${getDifficultyColor(interest.difficulty_level)}`}>
                  • {interest.difficulty_level}
                </span>
              ) : (
                <span className="ml-1 opacity-70 text-xs">
                  • No level assigned
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">You haven't selected any interests yet</p>
          <Button onClick={() => navigate('/select-interests')}>
            Select Interests
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserInterestsSection;
