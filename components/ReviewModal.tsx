import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Entity } from '../types';
import StarRating from './StarRating';

interface ReviewModalProps {
  entity: Entity;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ entity, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [dateWatched, setDateWatched] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, comment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-dark-800 rounded-xl w-full max-w-lg shadow-2xl border border-white/[0.08] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Rate & Review</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition p-1 rounded-md hover:bg-white/[0.05]">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex gap-5">
          <div className="w-20 shrink-0">
            <div className="aspect-[2/3] rounded-lg overflow-hidden border border-white/[0.06]" style={{ background: entity.image }} />
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-0.5">{entity.name}</h3>
              <p className="text-zinc-500 text-sm">{entity.subtitle || new Date().getFullYear()}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Date Watched</label>
              <div className="flex items-center gap-2 bg-dark-900 border border-white/[0.06] rounded-lg px-3 py-2 text-zinc-300">
                <Calendar size={14} className="text-zinc-500" />
                <input
                  type="date"
                  value={dateWatched}
                  onChange={(e) => setDateWatched(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Rating</label>
              <div className="flex items-center gap-3 py-1">
                <StarRating rating={rating} interactive onRate={setRating} size={24} />
                {rating > 0 && <span className="text-pitch-400 font-bold">{rating}</span>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Review</label>
              <textarea
                rows={3}
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bg-dark-900 border border-white/[0.06] rounded-lg p-3 text-sm text-zinc-300 focus:border-pitch-500/50 outline-none resize-none transition placeholder-zinc-600"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="bg-pitch-600 hover:bg-pitch-500 text-white font-semibold py-2 px-6 rounded-lg text-sm transition shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ReviewModal);
