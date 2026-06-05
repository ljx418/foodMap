import type { FoodRating } from "../domain/types";

interface Props {
  value: FoodRating;
  onChange?: (value: FoodRating) => void;
  readonly?: boolean;
}

export function RatingStars({ value, onChange, readonly }: Props) {
  return (
    <div className="rating-stars" aria-label={`评分 ${value}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= value ? "is-active" : ""}
          disabled={readonly}
          onClick={() => onChange?.(star as FoodRating)}
          aria-label={`${star} 星`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
