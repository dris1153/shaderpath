"use client";

import { useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { IconList, IconRoute } from "@tabler/icons-react";
import type { Locale } from "@/content/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CurriculumMapStrings } from "./curriculum-map";

const STORAGE_KEY = "roadmap-view";

// The xyflow bundle loads only when the map view is opened.
const CurriculumMap = dynamic(() => import("./curriculum-map"), {
  ssr: false,
  loading: () => <Skeleton className="mt-6 h-[70vh] min-h-120 w-full rounded-xl" />,
});

export function RoadmapViewToggle({
  locale,
  strings,
  listView,
}: {
  locale: Locale;
  strings: CurriculumMapStrings & { list: string; map: string };
  listView: ReactNode;
}) {
  // SSR always renders the list (deterministic); the stored preference is a
  // per-viewer convenience applied after mount.
  const [view, setView] = useState<"list" | "map">("list");

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "map") setView("map");
    } catch {
      // storage unavailable (private mode etc.) — keep the list default
    }
  }, []);

  const switchTo = (next: "list" | "map") => {
    setView(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // non-persistent is fine
    }
  };

  return (
    <div className="mt-6">
      <div className="flex gap-1" role="group" aria-label={`${strings.list} / ${strings.map}`}>
        <Button
          variant={view === "list" ? "secondary" : "ghost"}
          size="sm"
          aria-pressed={view === "list"}
          onClick={() => switchTo("list")}
        >
          <IconList /> {strings.list}
        </Button>
        <Button
          variant={view === "map" ? "secondary" : "ghost"}
          size="sm"
          aria-pressed={view === "map"}
          onClick={() => switchTo("map")}
        >
          <IconRoute /> {strings.map}
        </Button>
      </div>
      {view === "list" ? (
        listView
      ) : (
        <CurriculumMap locale={locale} strings={strings} />
      )}
    </div>
  );
}
