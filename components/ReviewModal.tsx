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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-800 rounded-lg w-full max-w-lg shadow-2xl border border-dark-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-800">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">I Watched / Support</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex gap-6">
           {/* Poster/Gradient */}
           <div className="w-24 shrink-0">
             <div className="aspect-[2/3] rounded overflow-hidden shadow-lg border border-dark-600" style={{ background: entity.image }}>
             </div>
           </div>

           {/* Form */}
           <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{entity.name}</h3>
                <p className="text-gray-400 text-sm">{entity.subtitle || new Date().getFullYear()}</p>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                 <div className="flex items-center gap-2 bg-dark-900 border border-dark-700 rounded px-3 py-2 text-gray-300">
                    <Calendar size={14} className="text-gray-500" />
                    <input 
                      type="date" 
                      value={dateWatched}
                      onChange={(e) => setDateWatched(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm w-full" 
                    />
                 </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Rating</label>
                <div className="flex items-center gap-3 py-1">
                   <StarRating rating={rating} interactive onRate={setRating} size={24} />
                   {rating > 0 && <span className="text-pitch-500 font-bold">{rating}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Review</label>
                <textarea 
                  rows={4}
                  placeholder="Add a review..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="bg-dark-900 border border-dark-700 rounded p-3 text-sm text-gray-300 focus:border-pitch-500 outline-none resize-none transition"
                />
              </div>

              <div className="flex justify-end pt-2">
                 <button 
                  type="submit"
                  className="bg-pitch-600 hover:bg-pitch-500 text-white font-bold py-2 px-6 rounded text-sm transition"
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
