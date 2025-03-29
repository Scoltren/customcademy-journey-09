
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface Category {
  id: number;
  name: string;
  quiz_id: number | null;
}

const SelectInterests = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.editMode || false;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Get categories
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, quiz_id");

        if (error) throw error;
        setCategories(data || []);
        
        // If we're in edit mode, get the user's current interests
        if (user) {
          const { data: userInterests, error: userInterestsError } = await supabase
            .from("user_interest_categories")
            .select("category_id")
            .eq("user_id", user.id);
            
          if (userInterestsError) throw userInterestsError;
          
          if (userInterests && userInterests.length > 0) {
            const currentInterests = userInterests.map(interest => interest.category_id);
            setSelectedCategories(currentInterests);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsFetching(false);
      }
    };

    fetchCategories();
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        if (prev.length >= 3) {
          toast.error("You can select a maximum of 3 categories");
          return prev;
        }
        return [...prev, categoryId];
      }
    });
  };

  const saveUserInterests = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    try {
      setIsLoading(true);
      
      // First delete all existing user interests
      const { error: deleteError } = await supabase
        .from("user_interest_categories")
        .delete()
        .eq("user_id", user.id);
      
      if (deleteError) throw deleteError;
      
      // Then insert the newly selected interests
      const { error } = await supabase.from("user_interest_categories").insert(
        selectedCategories.map(categoryId => ({
          user_id: user.id,
          category_id: categoryId
        }))
      );

      if (error) throw error;
      
      toast.success("Interests updated successfully!");
      
      // Check if in edit mode to determine where to navigate
      if (isEditMode) {
        navigate("/dashboard");
      } else {
        // Check if any selected categories have a quiz
        const categoriesWithQuizzes = categories
          .filter(cat => selectedCategories.includes(cat.id) && cat.quiz_id !== null)
          .map(cat => cat.quiz_id);
        
        if (categoriesWithQuizzes.length > 0) {
          // If there are quizzes, redirect to the quiz page
          navigate("/category-quiz", { 
            state: { 
              quizIds: categoriesWithQuizzes,
              categories: categories.filter(cat => selectedCategories.includes(cat.id))
            } 
          });
        } else {
          // If no quizzes, go to the dashboard
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error saving interests:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Failed to save your interests");
      } else {
        toast.error("Failed to save your interests");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackOrSkip = () => {
    if (isEditMode) {
      navigate("/dashboard");
    } else {
      toast.info("You can always select your interests later");
      navigate("/");
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
        <div className="text-white text-xl">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
      <div className="absolute top-4 left-4">
        <Button 
          variant="outline" 
          size="sm"
          className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
          onClick={handleBackOrSkip}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isEditMode ? "Back to Dashboard" : "Back to Homepage"}
        </Button>
      </div>
      <div className="w-full max-w-lg">
        <Card className="backdrop-blur-sm bg-slate-950 border-slate-800 shadow-xl transition-all duration-300">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight text-white">
              {isEditMode ? "Edit Your Interests" : "Select Your Interests"}
            </CardTitle>
            <CardDescription className="text-gray-300">
              Choose up to 3 categories that interest you the most
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className={`p-4 flex items-center gap-3 border rounded-md cursor-pointer transition-all ${
                    selectedCategories.includes(category.id) 
                      ? "border-blue-500 bg-blue-900/20" 
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  <Checkbox 
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                    id={`category-${category.id}`}
                  />
                  <label 
                    htmlFor={`category-${category.id}`}
                    className="flex-1 cursor-pointer font-medium text-white"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-300">
              {selectedCategories.length}/3 categories selected
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={saveUserInterests}
              disabled={isLoading || selectedCategories.length === 0}
            >
              {isLoading ? "Saving..." : isEditMode ? "Update Interests" : "Continue"}
            </Button>
            <Button
              variant="outline"
              className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={handleBackOrSkip}
            >
              {isEditMode ? "Cancel" : "Skip Selection"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SelectInterests;
