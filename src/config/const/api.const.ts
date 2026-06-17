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

export const API_FILES =
  process.env.NEXT_PUBLIC_FILES_API ||
  process.env.NEXT_PUBLIC_API ||
  "";
export const files = axios.create({
  baseURL: API_FILES,
});