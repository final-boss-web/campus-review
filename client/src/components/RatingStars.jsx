import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 0, size = 16, interactive = false, onChange }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : 'submit'} // Prevent form submission in forms
          disabled={!interactive}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`focus:outline-none transition ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <Star
            size={size}
            className={`${
              star <= displayRating
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300 dark:text-slate-700'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
