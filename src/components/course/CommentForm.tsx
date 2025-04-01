
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Star, StarHalf } from 'lucide-react';
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
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  
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
    
    // Allow comments without ratings or ratings without comments
    if (!values.comment.trim() && values.rating === 0) {
      toast.error('Please enter a comment or select a rating');
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
          comment_text: values.comment.trim() || null,
          rating: values.rating || null,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // If a rating was provided, update the course's overall rating
      if (values.rating > 0) {
        // Fetch all ratings for this course
        const { data: ratings, error: ratingsError } = await supabase
          .from('comments')
          .select('rating')
          .eq('course_id', courseId)
          .not('rating', 'is', null);
        
        if (ratingsError) throw ratingsError;
        
        // Calculate new average rating
        if (ratings && ratings.length > 0) {
          const sum = ratings.reduce((acc, item) => acc + (item.rating || 0), 0);
          const average = sum / ratings.length;
          
          // Update the course's overall_rating
          const { error: updateError } = await supabase
            .from('courses')
            .update({ overall_rating: parseFloat(average.toFixed(1)) })
            .eq('id', courseId);
            
          if (updateError) throw updateError;
        }
      }
      
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

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    form.setValue('rating', rating);
  };

  const renderStars = () => {
    const stars = [];
    const maxRating = 5;
    
    for (let i = 0.5; i <= maxRating; i += 0.5) {
      const filled = i <= (hoveredRating || selectedRating);
      const isHalfStar = i % 1 !== 0;
      
      stars.push(
        <div 
          key={i} 
          className="cursor-pointer"
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          {isHalfStar ? (
            <StarHalf 
              className={`${filled ? 'text-yellow-500' : 'text-gray-400'}`} 
              size={24} 
              fill={filled ? "currentColor" : "none"}
            />
          ) : (
            <Star 
              className={`${filled ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} 
              size={24} 
            />
          )}
        </div>
      );
    }
    
    return stars;
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
          <div className="mb-4">
            <FormLabel className="block mb-2">Rating</FormLabel>
            <div className="flex gap-1">
              {renderStars()}
            </div>
            <div className="mt-1 text-sm text-slate-400">
              {selectedRating > 0 ? `Selected: ${selectedRating} stars` : 'Click to rate'}
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Review (Optional)</FormLabel>
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
