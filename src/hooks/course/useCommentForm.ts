
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface FormValues {
  comment: string;
  rating: number;
}

export const useCommentForm = (
  onCommentAdded: () => void,
  courseProgress: number
) => {
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

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating);
    form.setValue('rating', rating);
  };

  const onSubmit = async (values: FormValues) => {
    if (!user?.id || !id) {
      toast.error('You must be logged in to comment');
      return;
    }
    
    if (courseProgress < 100) {
      toast.error('You must complete the course before commenting');
      return;
    }
    
    // Rating is required
    if (values.rating === 0) {
      toast.error('Please select a rating');
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
          rating: values.rating,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update the course's overall rating
      // Fetch all ratings for this course
      const { data: ratings, error: ratingsError } = await supabase
        .from('comments')
        .select('rating')
        .eq('course_id', courseId)
        .not('rating', 'is', null);
      
      if (ratingsError) throw ratingsError;
      
      // Calculate new average rating
      if (ratings && ratings.length > 0) {
        // Filter out any null or undefined ratings before calculating
        const validRatings = ratings.filter(item => item.rating !== null && item.rating !== undefined);
        const sum = validRatings.reduce((acc, item) => acc + (Number(item.rating) || 0), 0);
        const average = validRatings.length > 0 ? sum / validRatings.length : 0;
        
        // Update the course's overall_rating
        const { error: updateError } = await supabase
          .from('courses')
          .update({ overall_rating: parseFloat(average.toFixed(1)) })
          .eq('id', courseId);
          
        if (updateError) throw updateError;
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

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    hasCommented,
    isSubmitting,
    selectedRating,
    handleRatingChange,
    showForm: courseProgress >= 100 && !hasCommented && !!user
  };
};
