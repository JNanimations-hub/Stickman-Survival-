import { Config } from "@remotion/cli/config";
import fs from "fs";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Use an already-installed Chrome if one is found (cloud machines can't download Remotion's own).
// On your own computer none of these paths exist, and Remotion downloads its browser as normal.
const BROWSERS = [
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
  "/opt/pw-browsers/chromium/chrome-linux64/chrome",
];
const found = BROWSERS.find((p) => fs.existsSync(p));
if (found) Config.setBrowserExecutable(found);
