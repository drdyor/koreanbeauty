export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

// App constants
export const APP_NAME = "K-Beauty Glow";
export const APP_TAGLINE = "Discover Your Perfect K-Beauty Routine";

export const SHIPPING_COST = 500; // $5.00 in cents
export const FREE_SHIPPING_THRESHOLD = 5000; // $50.00 in cents
export const TAX_RATE = 0.10; // 10%

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
