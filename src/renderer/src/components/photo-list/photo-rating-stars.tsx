import { IconBan, IconStar, IconStarFilled } from '@tabler/icons-react';
import { cn } from 'cn';
import { useState } from 'react';

import { type PhotoRating } from '#/types';

const STARS = [1, 2, 3, 4, 5] as const;

type PhotoRatingStarsProps = {
  rating: number;
  interactive: boolean;
  onChange: (rating: PhotoRating) => void;
  showClear?: boolean;
  className?: string;
};

export function PhotoRatingStars({
  rating,
  interactive,
  onChange,
  showClear = false,
  className
}: PhotoRatingStarsProps) {
  const [hover, setHover] = useState<number | null>(null);
  const displayed = hover ?? rating;

  return (
    <span
      className={cn('inline-flex items-center gap-px', className)}
      onMouseLeave={() => setHover(null)}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {showClear ? (
        <button
          type="button"
          disabled={!interactive}
          aria-label="Clear rating"
          className={cn(
            'inline-flex size-3 shrink-0 items-center justify-center text-muted-foreground/70',
            interactive ? 'cursor-pointer hover:text-foreground' : 'pointer-events-none'
          )}
          onClick={() => {
            if (interactive) {
              onChange(0);
            }
          }}
        >
          <IconBan className="size-2.5" />
        </button>
      ) : null}
      {STARS.map((value) => {
        const filled = displayed >= value;
        const Icon = filled ? IconStarFilled : IconStar;
        return (
          <button
            key={value}
            type="button"
            disabled={!interactive}
            aria-label={rating === value ? `Clear ${value}-star rating` : `Rate ${value} stars`}
            className={cn(
              'inline-flex size-3 shrink-0 items-center justify-center',
              interactive ? 'cursor-pointer' : 'pointer-events-none',
              filled ? 'text-muted-foreground' : 'text-muted-foreground/55'
            )}
            onMouseEnter={() => {
              if (interactive) {
                setHover(value);
              }
            }}
            onClick={() => {
              if (!interactive) {
                return;
              }
              onChange(rating === value ? 0 : value);
            }}
          >
            <Icon className="size-2.5" stroke={1.5} />
          </button>
        );
      })}
    </span>
  );
}
