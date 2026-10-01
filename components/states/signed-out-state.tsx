"use client";

import { useTranslations } from "next-intl";
import { IconLock } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
  /** Primary button label; defaults to "Sign in". */
  signInLabel?: string;
  /** Dimmed, inert sample of what an account would show. */
  preview?: React.ReactNode;
};

/** What an account-only page shows a guest: why, how to sign in, and a way back to reading. */
export function SignedOutState({ title, description, signInLabel, preview }: Props) {
  const t = useTranslations("auth");
  const tStates = useTranslations("states");

  return (
    <section className="edge-card bg-card mt-8 flex flex-col items-start gap-4 rounded-xl p-6">
      <span className="bg-secondary text-link grid size-11 place-items-center rounded-xl">
        <IconLock className="size-6" aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl leading-tight">{title}</h2>
        <p className="text-muted-foreground max-w-prose">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/login" className={buttonVariants()}>
          {signInLabel ?? t("login")}
        </Link>
        <Link href="/register" className={buttonVariants({ variant: "secondary" })}>
          {t("register")}
        </Link>
        <Link href="/roadmap" className="text-link text-sm font-bold underline-offset-4 hover:underline">
          {tStates("keepReading")}
        </Link>
      </div>
      {preview ? (
        <div aria-hidden inert className="pointer-events-none mt-2 w-full opacity-40 select-none">
          {preview}
        </div>
      ) : null}
    </section>
  );
}
