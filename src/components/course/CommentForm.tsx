
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface CommentFormProps {
  onCommentAdded: () => void;
  courseProgress: number;
}

interface FormValues {
  comment: string;
  rating: number;
}

const CommentForm: React.FC<CommentFormProps> = ({ onCommentAdded, courseProgress }) => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [hasCommented, setHasCommented] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  
  const form = useForm<FormValues>({
    defaultValues: {
      comment: '',
      rating: 0,
    },
  });

  // Check if user has already commented on this course
  useEffect(() => {
    const checkExistingComment = async () => {
      if (!user?.id || !id) return;
      
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', parseInt(id, 10))
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error checking existing comment:', error);
          return;
        }
        
        setHasCommented(!!data);
      } catch (error) {
        console.error('Error checking existing comment:', error);
      }
    };
    
    checkExistingComment();
  }, [user?.id, id]);

  const onSubmit = async (values: FormValues) => {
    if (!user?.id || !id) {
      toast.error('You must be logged in to comment');
      return;
    }
    
    if (courseProgress < 100) {
      toast.error('You must complete the course before commenting');
      return;
    }
    
    if (values.rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!values.comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const courseId = parseInt(id, 10);
      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          comment_text: values.comment,
          rating: values.rating,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast.success('Your review has been posted!');
      form.reset();
      setSelectedRating(0);
      setHasCommented(true);
      onCommentAdded();
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      toast.error(error.message || 'Failed to submit your review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    form.setValue('rating', rating);
  };

  // If course is not completed or user has already commented, don't show the form
  if (courseProgress < 100 || hasCommented || !user) {
    return null;
  }

  return (
    <div className="glass-card my-8 p-6">
      <h3 className="text-xl font-bold mb-4">Write a Review</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center mb-4">
            <span className="mr-2">Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Star
                  key={rating}
                  className={`cursor-pointer ${
                    rating <= selectedRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                  }`}
                  size={24}
                  onClick={() => handleRatingClick(rating)}
                />
              ))}
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Review</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Share your thoughts about this course..."
                    className="min-h-[120px] bg-midnight/40"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CommentForm;
