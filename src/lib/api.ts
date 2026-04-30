import axios from "axios";

export const api = axios.create({
  baseURL:
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
      : "",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[api]", err?.response?.status, err?.message);
    }
    return Promise.reject(err);
  }
);
