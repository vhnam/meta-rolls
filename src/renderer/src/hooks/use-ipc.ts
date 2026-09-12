import { toast } from '#/components/ui/toast';

const toMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'An unexpected error occurred';

const withIpcErrorToast = <T>(value: T): T => {
  if (typeof value === 'function') {
    return ((...args: never[]) => {
      try {
        const result = value(...args);
        if (result instanceof Promise) {
          return result.catch((error: unknown) => {
            toast.add({
              type: 'error',
              title: 'Request failed',
              description: toMessage(error)
            });
            throw error;
          });
        }
        return result;
      } catch (error) {
        toast.add({
          type: 'error',
          title: 'Request failed',
          description: toMessage(error)
        });
        throw error;
      }
    }) as T;
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, next]) => [key, withIpcErrorToast(next)])
    ) as T;
  }

  return value;
};

let api: typeof window.api | undefined;

export const getApi = () => {
  api ??= withIpcErrorToast(window.api);
  return api;
};
