import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { type ErrorComponentProps } from '@tanstack/react-router';

import { Button } from '#/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle
} from '#/components/ui/empty';

const toMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'An unexpected error occurred.';

export default function AppErrorFallback({ error, reset }: ErrorComponentProps) {
  return (
    <Empty className="h-full">
      <EmptyMedia variant="icon">
        <IconAlertTriangle />
      </EmptyMedia>
      <EmptyContent>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>{toMessage(error)}</EmptyDescription>
      </EmptyContent>
      <Button variant="outline" onClick={reset}>
        <IconRefresh />
        Try again
      </Button>
    </Empty>
  );
}
