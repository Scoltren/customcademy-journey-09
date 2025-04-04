
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CourseCreationService, CourseFormData } from '@/services/CourseCreationService';
import { Course } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CourseBasicInfo } from '@/components/course-creation/sections/CourseBasicInfo';
import { CourseDetails } from '@/components/course-creation/sections/CourseDetails';
import { CoursePricing } from '@/components/course-creation/sections/CoursePricing';
import { CourseThumbnail } from '@/components/course-creation/sections/CourseThumbnail';
import { courseFormSchema, CourseFormValues } from '@/components/course-creation/schema/course-form-schema';

interface CourseEditFormProps {
  course: Course;
  onSuccess?: () => void;
}

/**
 * Form component to edit an existing course
 */
const CourseEditForm: React.FC<CourseEditFormProps> = ({ course, onSuccess }) => {
  // State for tracking file uploads and form submission
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with existing course data
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: course.title || '',
      description: course.description || '',
      difficulty_level: (course.difficulty_level as any) || 'beginner',
      category_id: course.category_id || undefined,
      course_time: course.course_time || 1,
      price: course.price || 0,
    },
  });
  
  /**
   * Handle form submission to update course
   */
  const onSubmit = async (values: CourseFormValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare course data for update
      const courseData: Partial<CourseFormData> = {
        title: values.title,
        description: values.description,
        difficulty_level: values.difficulty_level,
        category_id: values.category_id,
        course_time: values.course_time,
        price: values.price,
        thumbnail: thumbnailFile
      };
      
      // Call service to update course in database
      await CourseCreationService.updateCourse(course.id, courseData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Course update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Course basic information section (title, description) */}
          <CourseBasicInfo form={form} />
          {/* Course details section (category, difficulty, duration) */}
          <CourseDetails form={form} />
          {/* Course pricing section */}
          <CoursePricing form={form} />
          {/* Course thumbnail upload section */}
          <CourseThumbnail 
            form={form} 
            onThumbnailChange={setThumbnailFile}
            existingThumbnail={course.thumbnail}
          />
          
          {/* Submit button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Course...
              </>
            ) : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CourseEditForm;
