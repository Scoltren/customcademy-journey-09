
import React from 'react';
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
              onChange={(file) => {
                onThumbnailChange(file);
                field.onChange(file);
              }}
            />
          </FormControl>
          <FormDescription>
            Upload an image to represent your course. Recommended size 16:9.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
