
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import StarRating from './StarRating';
import { useCommentForm } from '@/hooks/course/useCommentForm';

interface CommentFormProps {
  onCommentAdded: () => void;
  courseProgress: number;
}

const CommentForm: React.FC<CommentFormProps> = ({ onCommentAdded, courseProgress }) => {
  const {
    form,
    onSubmit,
    hasCommented,
    isSubmitting,
    selectedRating,
    handleRatingChange,
    showForm
  } = useCommentForm(onCommentAdded, courseProgress);

  // If course is not completed or user has already commented, don't show the form
  if (!showForm) {
    return null;
  }

  return (
    <div className="glass-card my-8 p-6">
      <h3 className="text-xl font-bold mb-4">Write a Review</h3>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="mb-4">
            <FormLabel className="block mb-2 text-center">Rating <span className="text-red-500">*</span></FormLabel>
            <StarRating 
              selectedRating={selectedRating}
              onChange={handleRatingChange}
            />
            <div className="mt-1 text-sm text-slate-400 text-center">
              {selectedRating > 0 ? `Selected: ${selectedRating} stars` : 'Click to rate (required)'}
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
