import { Inko } from "@/components/mascot/inko";

type Props = {
  title: string;
  description: string;
  /** Links or buttons that lead somewhere useful. */
  children: React.ReactNode;
};

/** 404 and 500 pages: the only states that get Inko. */
export function FullPageState({ title, description, children }: Props) {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-4 px-4 py-16 text-center">
      <Inko pose="surprised" size={200} />
      <h1 className="text-4xl leading-tight">{title}</h1>
      <p className="text-muted-foreground text-lg">{description}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">{children}</div>
    </main>
  );
}
