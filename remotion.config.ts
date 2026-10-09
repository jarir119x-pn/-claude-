import {Config} from '@remotion/cli/config';
import {existsSync} from 'node:fs';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(18);
Config.setOverwriteOutput(true);

// في بيئة السحابة يتوفر Chromium مسبقًا؛ نستعمله بدل تنزيل نسخة جديدة.
const localShell =
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (existsSync(localShell)) {
  Config.setBrowserExecutable(localShell);
}
