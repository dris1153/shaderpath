import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { syncVideoDubs } from "@/lib/video-dubs";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "video-dubs-"));
const write = (file: string, text: string) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};

describe("syncVideoDubs", () => {
  it("copies each language's site.mp3 to <slug>/audio.<lang>.mp3 and skips lessons without one", () => {
    const lessons = tmp();
    const out = path.join(tmp(), "videos");
    write(path.join(lessons, "00-math", "vector-basics", "youtube", "languages", "vi", "site.mp3"), "dub");
    write(path.join(lessons, "00-math", "vector-basics", "youtube", "languages", "vi", "audio.mp3"), "master");
    write(path.join(lessons, "00-math", "vector-basics", "youtube", "languages", "en", "audio.mp3"), "english");
    write(path.join(lessons, "00-math", "no-video", "theory.en.mdx"), "text");

    expect(syncVideoDubs(lessons, out)).toHaveLength(1);
    expect(fs.readFileSync(path.join(out, "vector-basics", "audio.vi.mp3"), "utf8")).toBe("dub");
    expect(fs.existsSync(path.join(out, "no-video"))).toBe(false);
  });

  it("does nothing when the files already match, and refreshes a changed dub", () => {
    const lessons = tmp();
    const out = tmp();
    const site = path.join(lessons, "00-math", "a", "youtube", "languages", "vi", "site.mp3");
    write(site, "one");
    expect(syncVideoDubs(lessons, out)).toHaveLength(1);
    expect(syncVideoDubs(lessons, out)).toHaveLength(0);
    write(site, "two");
    expect(syncVideoDubs(lessons, out)).toHaveLength(1);
    expect(fs.readFileSync(path.join(out, "a", "audio.vi.mp3"), "utf8")).toBe("two");
  });

  it("tolerates a missing lessons folder", () => {
    expect(syncVideoDubs(path.join(tmp(), "nope"), tmp())).toEqual([]);
  });
});
