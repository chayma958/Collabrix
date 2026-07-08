import { isAxiosError } from 'axios';

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return fallback;
}

export function getErrorCode(error: unknown): string | undefined {
  if (isAxiosError(error) && typeof error.response?.data?.code === 'string') {
    return error.response.data.code;
  }
  return undefined;
}
