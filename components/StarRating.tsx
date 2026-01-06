import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxRating?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: number;
  showValue?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  maxRating = 5, 
  interactive = false, 
  onRate, 
  size = 16,
  showValue = false
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (!interactive) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    const isHalf = percent < 0.5;
    setHoverRating(index + (isHalf ? 0.5 : 1));
  };

  const handleClick = () => {
    if (interactive && onRate && hoverRating !== null) {
      onRate(hoverRating);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center" onMouseLeave={() => interactive && setHoverRating(null)}>
        {Array.from({ length: maxRating }).map((_, i) => {
          const filled = displayRating >= i + 1;
          const half = displayRating >= i + 0.5 && displayRating < i + 1;

          return (
            <div
              key={i}
              className={`relative cursor-${interactive ? 'pointer' : 'default'}`}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onClick={handleClick}
              style={{ width: size, height: size }}
            >
              <Star
                size={size}
                className={`absolute top-0 left-0 ${filled ? 'text-pitch-500 fill-pitch-500' : 'text-gray-600'}`}
              />
              {half && (
                <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
                   <Star size={size} className="text-pitch-500 fill-pitch-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className="text-gray-400 text-sm font-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
