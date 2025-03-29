
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  description?: string;
}

const SelectInterests = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/login');
    } else if (user) {
      fetchCategories();
      fetchUserInterests();
    }
  }, [user, isLoading, navigate]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error.message);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInterests = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_interest_categories')
        .select('category_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const categoryIds = data?.map(item => item.category_id) || [];
      setSelectedCategories(categoryIds);
    } catch (error: any) {
      console.error('Error fetching user interests:', error.message);
      toast.error('Failed to load your current interests');
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const saveInterests = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // First, delete all existing user interests
      const { error: deleteError } = await supabase
        .from('user_interest_categories')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) throw deleteError;
      
      // Then, insert new interests if any are selected
      if (selectedCategories.length > 0) {
        const interestsToInsert = selectedCategories.map(categoryId => ({
          user_id: user.id,
          category_id: categoryId
        }));
        
        const { error: insertError } = await supabase
          .from('user_interest_categories')
          .insert(interestsToInsert);
        
        if (insertError) throw insertError;
      }
      
      toast.success('Your interests have been updated');
      navigate('/');
    } catch (error: any) {
      console.error('Error saving interests:', error.message);
      toast.error('Failed to save your interests');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || (loading && !categories.length)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Select Your Interests</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Choose categories that interest you to get personalized course recommendations.
        </p>
        
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="flex items-start space-x-2 p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  <Checkbox 
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <div>
                    <label 
                      htmlFor={`category-${category.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {category.name}
                    </label>
                    {category.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                onClick={saveInterests}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Interests'
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SelectInterests;
