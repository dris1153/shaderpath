// Shared by the Export button and the mandatory pre-import backup — both
// need the exact same "hit the route, save the file" behavior.
export async function downloadExportFile(): Promise<void> {
  const res = await fetch("/api/progress/export");
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  const filename = match?.[1] ?? `shaderpath-progress-${new Date().toISOString().slice(0, 10)}.json`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
