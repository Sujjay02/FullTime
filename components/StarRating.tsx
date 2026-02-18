import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: number;
  showValue?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, maxRating = 5, interactive = false, onRate, size = 16, showValue = false }) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (!interactive) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    setHoverRating(index + (percent < 0.5 ? 0.5 : 1));
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center" onMouseLeave={() => interactive && setHoverRating(null)}>
        {Array.from({ length: maxRating }).map((_, i) => {
          const filled = displayRating >= i + 1;
          const half = displayRating >= i + 0.5 && displayRating < i + 1;
          return (
            <div
              key={i}
              className={`relative ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onClick={() => { if (interactive && onRate && hoverRating !== null) onRate(hoverRating); }}
              style={{ width: size, height: size }}
            >
              <Star size={size} className={`absolute top-0 left-0 ${filled ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
              {half && (
                <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star size={size} className="text-amber-400 fill-amber-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showValue && <span className="text-zinc-400 text-sm font-medium">{rating.toFixed(1)}</span>}
    </div>
  );
};

export default React.memo(StarRating);
