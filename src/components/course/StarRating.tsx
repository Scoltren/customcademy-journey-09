
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  selectedRating: number;
  onChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ selectedRating, onChange }) => {
  const [hoveredRating, setHoveredRating] = React.useState<number>(0);
  
  const renderStars = () => {
    const stars = [];
    const maxRating = 5;
    
    for (let i = 1; i <= maxRating; i++) {
      const filled = i <= (hoveredRating || selectedRating);
      
      stars.push(
        <div 
          key={i} 
          className="cursor-pointer"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
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
