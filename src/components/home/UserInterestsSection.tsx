
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
            <Badge key={interest.category_id} className="text-sm py-1 px-3">
              {interest.category?.name}
            </Badge>
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
