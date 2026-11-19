import axios from "axios";

const TOKEN_KEY = "@agroflow:token";
const USER_KEY = "@agroflow:user";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export const api = axios.create({
  baseURL,
});

function clearSession() {
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
    const requestUrl = error.config?.url ?? "";
    const isAuthRoute = requestUrl.includes("/login");

    if (status === 401 && typeof window !== "undefined" && !isAuthRoute) {
      clearSession();

      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);