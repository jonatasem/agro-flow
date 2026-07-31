import axios from "axios";

// Helper function to extract messages safely
export const getErrorMessage = (err: unknown, defaultMessage: string): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error || defaultMessage;
  }
  return err instanceof Error ? err.message : defaultMessage;
};
