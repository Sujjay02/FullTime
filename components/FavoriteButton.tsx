/**
 * Favorite Button Component
 * Star button to add/remove teams and players from favorites
 */

import React from 'react';
import { Star } from 'lucide-react';

interface FavoriteButtonProps {
  isFavorited: boolean;
  onToggle: () => void;
  size?: number;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorited,
  onToggle,
  size = 20,
  className = ''
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
        isFavorited
          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
          : 'bg-dark-700/50 text-gray-400 hover:bg-dark-700 hover:text-yellow-400'
      } ${className}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        size={size}
        className={`transition-all duration-300 ${
          isFavorited ? 'fill-yellow-400' : ''
        }`}
      />
    </button>
  );
};

export default FavoriteButton;
