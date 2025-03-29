
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  description?: string;
  quiz_id?: number | null;
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
      
      // Check if any selected categories have quizzes attached
      const categoriesWithQuizzes = categories.filter(
        category => selectedCategories.includes(category.id) && category.quiz_id
      );
      
      if (categoriesWithQuizzes.length > 0) {
        // Prepare data for quiz page
        const quizIds = categoriesWithQuizzes
          .map(category => category.quiz_id)
          .filter(id => id !== null) as number[];
          
        // Navigate to the quiz page with the quiz IDs
        navigate('/category-quiz', { 
          state: { 
            quizIds,
            categories: categoriesWithQuizzes
          }
        });
      } else {
        // If no categories with quizzes, go to the home page
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error saving interests:', error.message);
      toast.error('Failed to save your interests');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || (loading && !categories.length)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 py-12 px-4">
      <div className="absolute top-4 left-4">
        <Button 
          variant="outline" 
          size="sm"
          className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Homepage
        </Button>
      </div>
      
      <div className="container mx-auto max-w-4xl">
        <div className="backdrop-blur-sm bg-slate-950 border-slate-800 shadow-xl rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-4 text-white">Select Your Interests</h1>
          <p className="text-gray-300 mb-8">
            Choose categories that interest you to get personalized course recommendations.
          </p>
          
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="flex items-start space-x-3 p-4 border border-slate-700 rounded-md hover:bg-slate-800 cursor-pointer transition-all duration-200 bg-slate-900"
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    <Checkbox 
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                      className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div>
                      <label 
                        htmlFor={`category-${category.id}`}
                        className="font-medium cursor-pointer text-white"
                      >
                        {category.name}
                      </label>
                      {category.description && (
                        <p className="text-sm text-gray-400 mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  disabled={saving}
                  className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveInterests}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
    </div>
  );
};

export default SelectInterests;
