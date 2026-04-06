const VITE_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

/**
 * Convert Oracle HTTP file URLs to backend proxy URLs.
 * Fixes HTTPS mixed content by routing through the backend proxy.
 * Works for any Oracle-stored files (profile images, question images, etc.)
 */
export const toProxyUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  // Match Oracle direct URL pattern and rewrite to backend proxy
  const oraclePattern = /https?:\/\/140\.245\.240\.6:3000\/files\//;
  if (oraclePattern.test(url)) {
    const path = url.split("/files/")[1]?.split("?")[0]; // strip apiKey param
    return `${VITE_API_BASE_URL}/users/files/${path}`;
  }
  return url;
};
