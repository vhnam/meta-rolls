import { toast } from '#/components/ui/toast';

// ipcRenderer.invoke rejects with its own wrapper around whatever the main
// process threw, e.g. "Error invoking remote method 'media:rotate': Error:
// Rotate direction must be cw or ccw". Strip that down to the message the
// IPC handler actually threw, so the toast reads like an app message
// instead of an Electron internals dump.
const IPC_INVOKE_ERROR_PREFIX =
  /^Error invoking remote (?:handler|method) '[^']*':\s*(?:Error:\s*)?/;

const toMessage = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return 'An unexpected error occurred';
  }
  const message = error.message.replace(IPC_INVOKE_ERROR_PREFIX, '').trim();
  return message.length > 0 ? message : 'An unexpected error occurred';
};

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
