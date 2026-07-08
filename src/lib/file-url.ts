export function normalizeFileUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("storage.yandexcloud.net")) {
      return url;
    }

    return `/api/file-proxy?url=${encodeURIComponent(url)}`;
  } catch {
    return url;
  }
}
