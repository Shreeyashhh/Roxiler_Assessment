import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  showNumber = true
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const handleMouseEnter = (val) => {
    if (!readOnly) setHoverValue(val);
  };

  const handleMouseLeave = () => {
    if (!readOnly) setHoverValue(0);
  };

  const handleClick = (val) => {
    if (!readOnly && onChange) {
      onChange(val);
    }
  };

  const displayRating = hoverValue || value || 0;

  return (
    <div className="flex items-center space-x-1.5">
      <div className="flex items-center space-x-1" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= Math.floor(displayRating);
          const isHalf = !isFilled && starIndex <= Math.ceil(displayRating) && displayRating % 1 !== 0;

          return (
            <button
              key={starIndex}
              type="button"
              disabled={readOnly}
              onClick={() => handleClick(starIndex)}
              onMouseEnter={() => handleMouseEnter(starIndex)}
              className={`${readOnly ? 'cursor-default' : 'cursor-pointer transform hover:scale-110'} transition-transform focus:outline-none`}
              aria-label={`Rate ${starIndex} out of 5 stars`}
            >
              <Star
                className={`${starSizes[size]} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : isHalf
                    ? 'text-amber-400 fill-amber-400/50'
                    : 'text-slate-600 fill-slate-800'
                } transition-colors duration-150`}
              />
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-sm font-semibold text-amber-400 ml-1">
          {Number(value || 0).toFixed(1)}
        </span>
      )}
    </div>
  );
};
