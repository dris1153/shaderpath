"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MIN_PASSWORD = 8;

/**
 * Credential sign-in / sign-up. Runs in the browser so the Supabase SDK writes
 * the session cookies itself; the server then reads them like any other cookie.
 *
 * No email verification by product decision — the address is stored so a reset
 * flow can be added later without a migration.
 */
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "register" && password.length < MIN_PASSWORD) {
      setError(t("passwordTooShort", { min: MIN_PASSWORD }));
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { error: authError } =
        mode === "register"
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        // Supabase's message is English and leaks which half was wrong; show a
        // single neutral string so the form cannot be used to enumerate emails.
        setError(mode === "register" ? t("registerFailed") : t("loginFailed"));
        return;
      }
      // Every cached payload was fetched as a signed-out visitor: the header
      // still holds {user: null} and the progress map still holds an empty map.
      // refresh() only re-runs the server, so the client cache has to be
      // dropped explicitly.
      queryClient.clear();
      router.refresh();
      router.push("/");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          {t("email")}
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          {t("password")}
        </label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          required
          minLength={mode === "register" ? MIN_PASSWORD : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {mode === "register" && (
          <p className="text-muted-foreground text-xs">
            {t("passwordHint", { min: MIN_PASSWORD })}
          </p>
        )}
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("working") : mode === "register" ? t("register") : t("login")}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        {mode === "register" ? t("haveAccount") : t("noAccount")}{" "}
        <Link
          href={mode === "register" ? "/login" : "/register"}
          className="text-primary underline underline-offset-4"
        >
          {mode === "register" ? t("login") : t("register")}
        </Link>
      </p>
    </form>
  );
}
