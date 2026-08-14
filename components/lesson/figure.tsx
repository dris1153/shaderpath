// Static figure for lesson theory. The SVG is served from /public and loaded
// via <img>, so it is an isolated document: `currentColor` cannot reach it and
// each file carries its own prefers-color-scheme palette instead. That still
// tracks the in-app theme toggle, because next-themes writes `color-scheme`
// onto <html> and the browser propagates it into the embedded document.
export function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element -- local SVG, nothing for the image optimiser to do */}
      <img
        src={src}
        alt={alt}
        className="w-full rounded-lg border p-4"
        loading="lazy"
      />
      {caption ? (
        <figcaption className="text-muted-foreground mt-2 text-sm">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
