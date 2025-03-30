
import { z } from 'zod';

export const courseFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  difficulty_level: z.string(),
  category_id: z.coerce.number(),
  course_time: z.coerce.number().positive('Course time must be positive'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  thumbnail: z.any().optional(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
