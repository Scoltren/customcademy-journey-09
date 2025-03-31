
import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CourseCreationService } from '@/services/CourseCreationService';
import { CourseFormValues } from '../schema/course-form-schema';

interface CourseDetailsProps {
  form: UseFormReturn<CourseFormValues>;
}

// Define a proper type for the categories that matches the Supabase schema
interface Category {
  id: number;
  name: string;
  quiz_id: number | null;
}

export const CourseDetails = ({ form }: CourseDetailsProps) => {
  const [categoryHasQuiz, setCategoryHasQuiz] = useState<boolean>(false);
  
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: CourseCreationService.getCategories,
  });
  
  // Get the current category ID value from the form
  const categoryId = form.watch('category_id');
  
  // Check if the selected category has a quiz attached
  useEffect(() => {
    if (!categoryId || !categories) {
      setCategoryHasQuiz(false);
      return;
    }
    
    const selectedCategory = categories.find(
      (cat: Category) => cat.id.toString() === categoryId.toString()
    );
    
    // Check if the category has a quiz_id which indicates it has a quiz
    if (selectedCategory && selectedCategory.quiz_id !== null) {
      setCategoryHasQuiz(true);
    } else {
      setCategoryHasQuiz(false);
      // Reset difficulty level if category doesn't have a quiz
      form.setValue('difficulty_level', 'beginner');
    }
  }, [categoryId, categories, form]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="difficulty_level"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Difficulty Level</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              disabled={!categoryHasQuiz}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            {!categoryHasQuiz && (
              <FormDescription className="text-amber-500">
                Difficulty level selection requires a category with a quiz
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  categories?.map((category: Category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id.toString()}
                    >
                      {category.name} {category.quiz_id !== null ? '(Has Quiz)' : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
