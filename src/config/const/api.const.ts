import axios from "axios";

export const API_SHRTL = process.env.NEXT_PUBLIC_SHRTL_API || "";
export const shrtl = axios.create({
  baseURL: API_SHRTL,
});

export const API_NOTTER = process.env.NEXT_PUBLIC_NOTTER_API || "";
export const notter = axios.create({
  baseURL: API_NOTTER,
});