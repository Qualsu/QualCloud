export const COOKIE_REDIRECT_HOME = "qualcloud-redirect-home";
export const COOKIE_DISPLAY_MODE = "qualcloud-display-mode";

export function setCookie(name: string, value: string, maxAgeDays = 365) {
  if (typeof document === "undefined") return;

  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`;
}

export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=;path=/;max-age=0;SameSite=Lax`;
}
