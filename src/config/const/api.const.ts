import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

export const API = process.env.NEXT_PUBLIC_API || "";
export const API_SHRTL = process.env.NEXT_PUBLIC_SHRTL_API || "";
export const API_NOTTER = process.env.NEXT_PUBLIC_NOTTER_API || "";

export const api = axios.create({
  baseURL: API,
  timeout: 10_000,
});

export const shrtl = axios.create({
  baseURL: API_SHRTL,
  timeout: 10_000,
});

export const notter = axios.create({
  baseURL: API_NOTTER,
  timeout: 10_000,
});

export const files = axios.create({
  baseURL: API,
  timeout: 30_000,
});

let clerkTokenGetter: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(getter: () => Promise<string | null>) {
  clerkTokenGetter = getter;
}

function attachClerkAuth(instance: AxiosInstance) {
  instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (!clerkTokenGetter || config.headers.Authorization) {
      return config;
    }

    try {
      const token = await clerkTokenGetter();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
    }

    return config;
  });
}

attachClerkAuth(api);
attachClerkAuth(shrtl);
attachClerkAuth(notter);
attachClerkAuth(files);