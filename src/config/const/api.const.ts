import axios from "axios";

export const API = process.env.NEXT_PUBLIC_API || "";
export const api = axios.create({
  baseURL: API,
});

export const API_SHRTL = process.env.NEXT_PUBLIC_SHRTL_API || "";
export const shrtl = axios.create({
  baseURL: API_SHRTL,
});

export const API_NOTTER = process.env.NEXT_PUBLIC_NOTTER_API || "";
export const notter = axios.create({
  baseURL: API_NOTTER,
});

export const files = axios.create({
  baseURL: API,
});

let clerkTokenGetter: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(getter: () => Promise<string | null>) {
  clerkTokenGetter = getter;
}

notter.interceptors.request.use(async (config) => {
  if (!clerkTokenGetter || config.headers.Authorization) {
    return config;
  }

  try {
    const token = await clerkTokenGetter();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Leave request unauthenticated so the caller's error handling applies.
  }

  return config;
});