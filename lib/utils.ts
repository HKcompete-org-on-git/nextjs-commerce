import { ReadonlyURLSearchParams } from "next/navigation";

export const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL && /^https?:\/\//i.test(process.env.NEXT_PUBLIC_SITE_URL!)
    ? process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/+$/, "")
    : "http://127.0.0.1:3011";

export const createUrl = (
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams
) => {
  const qs = params.toString();
  return `${pathname}${qs ? `?${qs}` : ""}`;
};

export const ensureStartsWith = (value: string, prefix: string) =>
  value.startsWith(prefix) ? value : `${prefix}${value}`;
