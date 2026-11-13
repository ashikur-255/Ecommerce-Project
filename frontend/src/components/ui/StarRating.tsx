import { FiStar } from "react-icons/fi";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  showValue?: boolean;
  reviewCount?: number;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  max = 5,
  size = 18,
  interactive = false,
  showValue = false,
  reviewCount,
  onChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating ?? rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, index) => {
          const starValue = index + 1;
          const filled = starValue <= displayRating;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
              onClick={() => onChange?.(starValue)}
              onMouseEnter={() =>
                interactive && setHoverRating(starValue)
              }
              onMouseLeave={() =>
                interactive && setHoverRating(null)
              }
              className={`
                transition-all duration-200
                ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}
              `}
            >
              <FiStar
                size={size}
                className={`
                  transition-all duration-200
                  ${
                    filled
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }
                `}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <div className="flex items-center gap-1 text-sm">
          <span className="font-semibold text-gray-800">
            {rating.toFixed(1)}
          </span>

          {reviewCount !== undefined && (
            <span className="text-gray-500">
              ({reviewCount} reviews)
            </span>
          )}
        </div>
      )}
    </div>
  );
}