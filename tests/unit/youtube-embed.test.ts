import { describe, expect, it } from "vitest";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/youtube-embed";

describe("youtubeEmbedUrl", () => {
  it("uses the no-cookie host and the page language", () => {
    const url = new URL(youtubeEmbedUrl("abc123", "en", false));
    expect(url.origin + url.pathname).toBe("https://www.youtube-nocookie.com/embed/abc123");
    expect(url.searchParams.get("hl")).toBe("en");
    expect(url.searchParams.get("cc_lang_pref")).toBe("en");
    expect(url.searchParams.get("cc_load_policy")).toBeNull();
  });

  it("turns on captions in the reader's language when asked", () => {
    const url = new URL(youtubeEmbedUrl("abc123", "vi", true));
    expect(url.searchParams.get("cc_lang_pref")).toBe("vi");
    expect(url.searchParams.get("cc_load_policy")).toBe("1");
  });

  it("escapes the id", () => {
    expect(youtubeEmbedUrl("a/b?c", "en", false)).toContain("/embed/a%2Fb%3Fc?");
    expect(youtubeThumbnailUrl("a/b")).toBe("https://i.ytimg.com/vi/a%2Fb/hqdefault.jpg");
  });
});
