"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const config = {
  minutes: { label: "min", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function TrackDistribution({
  data,
}: {
  data: { track: string; minutes: number }[];
}) {
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="track"
          width={150}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="minutes" fill="var(--color-minutes)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
