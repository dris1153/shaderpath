import type { Icon } from "@tabler/icons-react";

type Props = {
  icon: Icon;
  title: string;
  /** What to do next, in one line. */
  cue: string;
  action?: React.ReactNode;
};

/** Nothing here yet: an icon, what is missing, and the next step. */
export function EmptyState({ icon: IconComponent, title, cue, action }: Props) {
  return (
    <div className="border-border mt-8 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center">
      <span className="bg-secondary text-link grid size-12 place-items-center rounded-xl">
        <IconComponent className="size-6" aria-hidden />
      </span>
      <p className="text-lg font-extrabold">{title}</p>
      <p className="text-muted-foreground max-w-prose">{cue}</p>
      {action}
    </div>
  );
}
