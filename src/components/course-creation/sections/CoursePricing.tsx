
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CourseFormValues } from '../schema/course-form-schema';

interface CoursePricingProps {
  form: UseFormReturn<CourseFormValues>;
}

/**
 * Component for course pricing form fields
 */
export const CoursePricing = ({ form }: CoursePricingProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="course_time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course Duration (hours)</FormLabel>
            <FormControl>
              <Input type="number" min="0.5" step="0.5" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price ($)</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
