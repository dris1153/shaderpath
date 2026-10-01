import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Inko } from "@/components/mascot/inko";
import { UserMenu } from "@/components/auth/user-menu";
import { MainNav } from "./main-nav";
import { SearchPill } from "./search-pill";

export async function AppHeader() {
  const t = await getTranslations("app");
  const tA11y = await getTranslations("a11y");

  return (
    <header className="bg-card sticky top-0 z-40 border-b-2">
      <div className="container mx-auto flex h-16 w-full items-center gap-3 px-4 md:gap-5">
        <Link href="/" className="font-heading flex shrink-0 items-center gap-1.5 text-2xl font-extrabold tracking-tight">
          <Inko size={40} className="motion-safe:animate-none" />
          {t("name")}
        </Link>
        <MainNav label={tA11y("mainNav")} />
        <div className="ml-auto flex items-center gap-1.5">
          <SearchPill />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
