
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, quiz_id");

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsFetching(false);
      }
    };

    fetchCategories();
  }, []);

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
      
      const userId = parseInt(user.id);
      
      // Save user interests to user_interest_categories table
      const { error } = await supabase.from("user_interest_categories").insert(
        selectedCategories.map(categoryId => ({
          user_id: userId,
          category_id: categoryId
        }))
      );

      if (error) throw error;
      
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
        toast.success("Preferences saved successfully!");
        navigate("/dashboard");
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

  const skipSelection = () => {
    toast.info("You can always select your interests later");
    navigate("/");
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 p-4">
        <div className="text-white text-xl">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 p-4">
      <div className="absolute top-4 left-4">
        <Button 
          variant="outline" 
          size="sm"
          className="bg-white/80 hover:bg-white"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Homepage
        </Button>
      </div>
      <div className="w-full max-w-lg">
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-black/80 border-none shadow-xl transition-all duration-300">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">Select Your Interests</CardTitle>
            <CardDescription className="text-muted-foreground">
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
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                      : "border-gray-200 hover:border-gray-300"
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
                    className="flex-1 cursor-pointer font-medium"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center text-sm">
              {selectedCategories.length}/3 categories selected
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              className="w-full bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
              onClick={saveUserInterests}
              disabled={isLoading || selectedCategories.length === 0}
            >
              {isLoading ? "Saving..." : "Continue"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={skipSelection}
            >
              Skip Selection
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SelectInterests;
