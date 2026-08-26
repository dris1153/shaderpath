import { test } from "@playwright/test";

// Specs that write user data need a signed-in account, and there is no local
// auth server: the e2e run points the app at a Docker Postgres, while Supabase
// Auth lives in the cloud. Rather than ship a test-only bypass — an
// authentication side door living in the repo, one mis-set Vercel variable away
// from being real — those specs skip unless credentials are supplied.
//
// To run them, point the e2e app at a Supabase project and give it an account
// that already exists there:
//
//   E2E_SUPABASE_EMAIL=... E2E_SUPABASE_PASSWORD=... pnpm test:e2e
//
// Everything that only reads content — a11y, smoke, keyboard nav, figures,
// demos, playground compilation — runs signed out and needs none of this.

export const E2E_EMAIL = process.env.E2E_SUPABASE_EMAIL;
export const E2E_PASSWORD = process.env.E2E_SUPABASE_PASSWORD;
export const hasAuthCredentials = Boolean(E2E_EMAIL && E2E_PASSWORD);

/** Call at the top of a spec file that cannot run signed out. */
export function requiresAuth() {
  test.skip(
    !hasAuthCredentials,
    "needs E2E_SUPABASE_EMAIL / E2E_SUPABASE_PASSWORD — see tests/e2e/requires-auth.ts",
  );
}

/** Signs in through the real form so the session cookies are the real ones. */
export async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/vi/login");
  await page.getByLabel(/Email/i).fill(E2E_EMAIL as string);
  await page.getByLabel(/Mật khẩu|Password/i).fill(E2E_PASSWORD as string);
  await page.getByRole("button", { name: /Đăng nhập|Sign in/i }).click();
  // The header swaps the sign-in button for the account menu once the session
  // cookie is readable by the server.
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 30_000,
  });
}
