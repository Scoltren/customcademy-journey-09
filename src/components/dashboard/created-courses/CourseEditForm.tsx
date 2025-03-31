
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

const CourseEditForm: React.FC<CourseEditFormProps> = ({ course, onSuccess }) => {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const onSubmit = async (values: CourseFormValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const courseData: Partial<CourseFormData> = {
        title: values.title,
        description: values.description,
        difficulty_level: values.difficulty_level,
        category_id: values.category_id,
        course_time: values.course_time,
        price: values.price,
        thumbnail: thumbnailFile
      };
      
      await CourseCreationService.updateCourse(course.id, courseData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Course update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CourseBasicInfo form={form} />
          <CourseDetails form={form} />
          <CoursePricing form={form} />
          <CourseThumbnail 
            form={form} 
            onThumbnailChange={setThumbnailFile}
            existingThumbnail={course.thumbnail}
          />
          
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
