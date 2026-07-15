import { AxiosInstance, AxiosRequestConfig } from "axios";
import { api, files, notter, shrtl } from "@/config/const/api.const";

type AnyInstance = AxiosInstance;

function pickInstance(instance?: AnyInstance): AnyInstance {
  return instance ?? api;
}

export async function apiGet<T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
  instance?: AnyInstance,
): Promise<T | null> {
  try {
    const res = await pickInstance(instance).get<T>(url, config);
    return res.data;
  } catch {
    return null;
  }
}

export async function apiPost<T = unknown>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
  instance?: AnyInstance,
): Promise<T | null> {
  try {
    const res = await pickInstance(instance).post<T>(url, body, config);
    return res.data;
  } catch {
    return null;
  }
}

export async function apiPut<T = unknown>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
  instance?: AnyInstance,
): Promise<T | null> {
  try {
    const res = await pickInstance(instance).put<T>(url, body, config);
    return res.data;
  } catch {
    return null;
  }
}

export async function apiDelete<T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
  instance?: AnyInstance,
): Promise<T | null> {
  try {
    const res = await pickInstance(instance).delete<T>(url, config);
    return res.data;
  } catch {
    return null;
  }
}

export { api, files, notter, shrtl };