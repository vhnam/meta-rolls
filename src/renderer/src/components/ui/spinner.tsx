import { IconLoader } from '@tabler/icons-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '#/utils/common';

const spinnerVariants = cva('size-4 animate-spin', {
  variants: {
    tone: {
      default: 'text-muted-foreground',
      inverted: 'text-white'
    }
  },
  defaultVariants: {
    tone: 'default'
  }
});

function Spinner({
  className,
  tone,
  ...props
}: React.ComponentProps<'svg'> & VariantProps<typeof spinnerVariants>) {
  return (
    <IconLoader
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ tone }), className)}
      {...props}
    />
  );
}

export { Spinner };
