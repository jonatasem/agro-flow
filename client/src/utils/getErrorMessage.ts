import axios from "axios";

export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; message?: string }
      | undefined;
    return data?.error || data?.message || defaultMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return defaultMessage;
}