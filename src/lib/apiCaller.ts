import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const apiCaller = axios.create({
  baseURL:
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
      : "",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiCaller.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ error?: string }>) => {
    const status = err.response?.status;
    const msg =
      err.response?.data?.error ?? err.message ?? "Request failed";
    if (process.env.NODE_ENV !== "production") {
      console.error("[apiCaller]", status, msg);
    }
    return Promise.reject(
      Object.assign(new Error(msg), { status, cause: err }),
    );
  },
);

export async function request<T>(
  config: AxiosRequestConfig,
): Promise<T> {
  const res: AxiosResponse<T> = await apiCaller.request<T>(config);
  return res.data;
}

export default apiCaller;
