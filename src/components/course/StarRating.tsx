
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  selectedRating: number;
  onChange: (rating: number) => void;
}

/**
 * Component for interactive star rating selection
 */
const StarRating: React.FC<StarRatingProps> = ({ selectedRating, onChange }) => {
  // State to track star that's currently being hovered
  const [hoveredRating, setHoveredRating] = React.useState<number>(0);
  
  /**
   * Renders the star icons based on current selection and hover state
   */
  const renderStars = () => {
    const stars = [];
    const maxRating = 5;
    
    // Create 5 star elements
    for (let i = 1; i <= maxRating; i++) {
      // Determine if star should be filled based on hover state or selected rating
      const filled = i <= (hoveredRating || selectedRating);
      
      stars.push(
        <div 
          key={i} 
          className="cursor-pointer"
          onClick={() => onChange(i)} // Update rating when clicked
          onMouseEnter={() => setHoveredRating(i)} // Set hovered state
          onMouseLeave={() => setHoveredRating(0)} // Clear hover state when mouse leaves
        >
          <Star 
            className={`${filled ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} 
            size={24} 
          />
        </div>
      );
    }
    
    return stars;
  };

  return (
    <div className="flex justify-center gap-2">
      {renderStars()}
    </div>
  );
};

export default StarRating;
