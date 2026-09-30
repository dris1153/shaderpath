// Studio and the Remotion CLI only. `pnpm render` / `pnpm stills` use the Node
// API, which never reads this file; their shared settings live in
// scripts/remotion.ts.
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
