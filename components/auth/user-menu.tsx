"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { IconLogout, IconUser } from "@tabler/icons-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const t = useTranslations("auth");
  const { data, isPending } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Same height as the button so the header does not jump when it resolves.
  if (isPending) return <Skeleton className="h-8 w-8 rounded-lg" />;

  if (!data?.user) {
    return (
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link href="/login" />}
      >
        {t("login")}
      </Button>
    );
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    // Every cached payload belongs to the account that just left.
    queryClient.clear();
    router.refresh();
    router.push("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={t("account")}>
            <IconUser />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-max">
        <DropdownMenuItem disabled className="text-muted-foreground text-xs">
          {data.user.email ?? t("account")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut}>
          <IconLogout />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
