import { getTranslations } from "next-intl/server";
import { listSnippets } from "@/lib/playground";
import { PlaygroundClient } from "@/components/playground/playground-client";

// Snippets come from SQLite on every request
export const dynamic = "force-dynamic";

export default async function PlaygroundPage() {
  const t = await getTranslations("playground");
  const snippets = await listSnippets();

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground mt-2 mb-6">{t("subtitle")}</p>
      <PlaygroundClient initialSnippets={snippets} />
    </main>
  );
}
