
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { FileUploader } from '../FileUploader';
import { CourseFormValues } from '../schema/course-form-schema';

interface CourseThumbnailProps {
  form: UseFormReturn<CourseFormValues>;
  onThumbnailChange: (file: File | null) => void;
}

export const CourseThumbnail = ({ form, onThumbnailChange }: CourseThumbnailProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    onThumbnailChange(file);
    form.setValue('thumbnail', file);
    
    // Create preview URL if file exists
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Clean up URL when component unmounts or file changes
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
      return undefined;
    }
  };

  return (
    <FormField
      control={form.control}
      name="thumbnail"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Course Thumbnail</FormLabel>
          <FormControl>
            <FileUploader
              accept="image/*"
              onChange={handleFileChange}
            />
          </FormControl>
          <FormDescription>
            Upload an image to represent your course. Recommended size 16:9.
          </FormDescription>
          {previewUrl && (
            <div className="mt-2">
              <img 
                src={previewUrl} 
                alt="Thumbnail preview" 
                className="max-h-40 rounded-md border border-gray-300"
              />
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
