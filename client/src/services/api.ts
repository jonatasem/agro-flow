import axios from "axios";

export const TOKEN_KEY = "@agroflow:token";
export const USER_KEY = "@agroflow:user";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export const api = axios.create({
  baseURL,
});

let isRedirectingToLogin = false;

export function clearSessionStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const isAuthRoute = url.includes("/login");

    if (status === 401 && typeof window !== "undefined" && !isAuthRoute) {
      clearSessionStorage();

      if (!window.location.pathname.startsWith("/login") && !isRedirectingToLogin) {
        isRedirectingToLogin = true;
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);