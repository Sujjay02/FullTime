import React from 'react';
import { Star } from 'lucide-react';

interface FavoriteButtonProps {
  isFavorited: boolean;
  onToggle: () => void;
  size?: number;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ isFavorited, onToggle, size = 20, className = '' }) => {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
        isFavorited ? 'bg-amber-500/15 text-amber-400' : 'bg-white/[0.05] text-zinc-500 hover:text-amber-400'
      } ${className}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star size={size} className={isFavorited ? 'fill-amber-400' : ''} />
    </button>
  );
};

export default FavoriteButton;
