
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { CourseCreationService, CourseFormData } from '@/services/CourseCreationService';
import { FormLayout } from './layout/FormLayout';
import { CourseBasicInfo } from './sections/CourseBasicInfo';
import { CourseDetails } from './sections/CourseDetails';
import { CoursePricing } from './sections/CoursePricing';
import { CourseThumbnail } from './sections/CourseThumbnail';
import { courseFormSchema, CourseFormValues } from './schema/course-form-schema';

interface CourseFormProps {
  onSubmitSuccess: (courseId: number) => void;
  userId: string;
}

export const CourseForm = ({ onSubmitSuccess, userId }: CourseFormProps) => {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty_level: 'beginner',
      category_id: undefined,
      course_time: 1,
      price: 0,
    },
  });
  
  const onSubmit = async (values: CourseFormValues) => {
    try {
      const courseData: CourseFormData = {
        title: values.title,
        description: values.description,
        difficulty_level: values.difficulty_level,
        category_id: values.category_id,
        course_time: values.course_time,
        price: values.price,
        thumbnail: thumbnailFile
      };
      
      const course = await CourseCreationService.createCourse(courseData, userId);
      toast.success('Course created successfully! Now add chapters.');
      onSubmitSuccess(course.id);
    } catch (error) {
      console.error('Course form submission error:', error);
      toast.error('Failed to create course. Please try again.');
    }
  };
  
  return (
    <FormLayout 
      title="Create a New Course"
      description="Fill in the details to create your course."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CourseBasicInfo form={form} />
          <CourseDetails form={form} />
          <CoursePricing form={form} />
          <CourseThumbnail 
            form={form} 
            onThumbnailChange={setThumbnailFile} 
          />
          
          <Button type="submit" className="w-full">
            Continue to Add Chapters
          </Button>
        </form>
      </Form>
    </FormLayout>
  );
};
