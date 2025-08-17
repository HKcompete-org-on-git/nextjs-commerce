import { ReadonlyURLSearchParams } from 'next/navigation';

// Use env if provided, otherwise fall back to your dev URL (port 3010)
export const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith('http')
    ? process.env.NEXT_PUBLIC_SITE_URL!
    : process.env.NEXT_PUBLIC_SITE_URL
    ? `https://${process.env.NEXT_PUBLIC_SITE_URL}`
    : 'http://127.0.0.1:3010';

export const createUrl = (
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams
) => {
  const qs = params.toString();
  return `${pathname}${qs ? `?${qs}` : ''}`;
};

export const ensureStartsWith = (s: string, prefix: string) =>
  s.startsWith(prefix) ? s : `${prefix}${s}`;

// (Optional, used in some templates)
export const validateEnvironmentVariables = () => {
  const required = ['SHOPIFY_STORE_DOMAIN', 'SHOPIFY_STOREFRONT_ACCESS_TOKEN'];
  const missing: string[] = [];
  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }
  if (missing.length) {
    throw new Error(
      `Missing required env vars:\n${missing.join('\n')}\n` +
        `Add them to .env.local`
    );
  }
};

