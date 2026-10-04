import path from "node:path";
import { syncVideoDubs } from "../lib/video-dubs";

// Runs before `next build` and `next dev`: copies each lesson's site.mp3 to public/videos/.
const copied = syncVideoDubs(path.join(process.cwd(), "content", "lessons"), path.join(process.cwd(), "public", "videos"));
console.log(`sync:dubs ${copied.length} copied`);
