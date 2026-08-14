import { getTranslations } from "next-intl/server";
import { weeksGrid } from "@/lib/date-buckets";
import { cn } from "@/lib/utils";

function intensity(minutes: number): string {
  if (minutes <= 0) return "bg-muted";
  if (minutes < 15) return "bg-primary/25";
  if (minutes < 30) return "bg-primary/50";
  if (minutes < 60) return "bg-primary/75";
  return "bg-primary";
}

// GitHub-style contribution grid — plain divs, no chart lib needed.
export async function Heatmap({
  minutesByDay,
  now,
}: {
  minutesByDay: Record<string, number>;
  now: Date;
}) {
  const t = await getTranslations("stats");
  const grid = weeksGrid(now, 26);

  return (
    <div className="overflow-x-auto">
      <div className="flex w-max gap-[3px]" data-testid="heatmap">
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((key, di) => {
              const minutes = key ? Math.round(minutesByDay[key] ?? 0) : 0;
              return (
                <div
                  key={di}
                  title={key ? t("heatmapCell", { date: key, minutes }) : undefined}
                  className={cn(
                    "size-3 rounded-[3px]",
                    key ? intensity(minutes) : "bg-transparent",
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
