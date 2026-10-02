"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  IconAdjustmentsHorizontal,
  IconChartBar,
  IconLogout,
  IconNote,
  IconSettings,
} from "@tabler/icons-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { LocaleMenuGroup } from "@/components/shell/locale-switcher";
import { ThemeMenuGroup } from "@/components/shell/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Account menu when signed in; a preferences menu plus Sign in for guests. */
export function UserMenu() {
  const t = useTranslations("auth");
  const tNav = useTranslations("nav");
  const { data, isPending } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Sized like the guest controls (preferences icon + Sign in), the common case,
  // so the search pill beside it does not slide when the session resolves.
  if (isPending) return <Skeleton className="h-9 w-[151px] rounded-lg" />;

  const user = data?.user;
  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label={tNav("preferences")}>
                <IconAdjustmentsHorizontal />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-48">
            <LocaleMenuGroup />
            <DropdownMenuSeparator />
            <ThemeMenuGroup />
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/settings" />}>
              <IconSettings />
              {tNav("settings")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="/login" className={buttonVariants({ size: "sm" })}>
          {t("login")}
        </Link>
      </div>
    );
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    // Every cached payload belongs to the account that just left.
    queryClient.clear();
    router.refresh();
    router.push("/");
  }

  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={t("account")} className="rounded-full">
            <span className="bg-sun text-ink grid size-8 place-items-center rounded-full text-sm font-extrabold shadow-[0_3px_0_var(--sun-edge)]">
              {initial}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">{user.email ?? t("account")}</DropdownMenuLabel>
          <DropdownMenuItem render={<Link href="/stats" />}>
            <IconChartBar />
            {tNav("stats")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/notes" />}>
            <IconNote />
            {tNav("notes")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/settings" />}>
            <IconSettings />
            {tNav("settings")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <LocaleMenuGroup />
        <DropdownMenuSeparator />
        <ThemeMenuGroup />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <IconLogout />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
