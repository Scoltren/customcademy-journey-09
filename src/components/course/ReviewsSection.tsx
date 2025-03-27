
import React from 'react';
import { Star, MessageSquare, StarHalf } from 'lucide-react';
import { Comment, Course } from '@/types/course';

interface ReviewsSectionProps {
  course: Course;
  comments: Comment[];
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ course, comments }) => {
  return (
    <section className="container mx-auto px-6 mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="heading-md">Reviews</h2>
        <div className="flex items-center gap-2">
          <StarHalf className="text-yellow-500" size={20} />
          <span className="text-lg font-bold">{course?.overall_rating ? course.overall_rating.toFixed(1) : '0.0'} Overall Rating</span>
        </div>
      </div>
      
      <div className="glass-card">
        {comments.length > 0 ? (
          <div className="divide-y divide-slate-700/50">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${comment.username?.replace(' ', '+')}&background=random`}
                      alt={comment.username} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-bold">{comment.username}</h4>
                        <div className="text-xs text-slate-400">
                          {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Unknown date'}
                        </div>
                      </div>
                      {comment.rating && (
                        <div className="flex items-center">
                          <Star className="text-yellow-500" size={16} />
                          <span className="ml-1">{comment.rating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-slate-300">{comment.comment_text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <MessageSquare className="mx-auto mb-4 text-slate-500" size={40} />
            <p className="text-slate-400">No reviews available for this course yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
