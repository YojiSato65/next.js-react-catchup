const DEFAULT_BASE_URL = "http://localhost:3000";
const EXPLICIT_BASE_URL =
  process.env.NEXT_PUBLIC_APP_BASE_URL ||
  process.env.APP_BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL;

const DEPLOYMENT_BASE_URL = process.env.VERCEL_URL;

function normalizeBaseUrl(input?: string | null): string | null {
  if (!input) return null;
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }
  return `https://${input}`;
}

export function getAppBaseUrl(): string {
  return (
    normalizeBaseUrl(EXPLICIT_BASE_URL) ||
    normalizeBaseUrl(DEPLOYMENT_BASE_URL) ||
    DEFAULT_BASE_URL
  );
}

export const DATA_CACHE_REVALIDATE_SECONDS = 15;
