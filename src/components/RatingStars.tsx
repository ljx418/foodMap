import type { FoodRating } from "../domain/types";

interface Props {
  value: FoodRating;
  onChange?: (value: FoodRating) => void;
  readonly?: boolean;
}

export function RatingStars({ value, onChange, readonly }: Props) {
  const displayValue = Number(value.toFixed(1)).toString();
  const filledStars = Math.round(value);
  return (
    <div className="rating-stars" aria-label={`评分 ${value}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= filledStars ? "is-active" : ""}
          disabled={readonly}
          onClick={() => onChange?.(star as FoodRating)}
          aria-label={`${star} 星`}
        >
          ★
        </button>
      ))}
      <span className="rating-stars__value">{displayValue} 星</span>
    </div>
  );
}
