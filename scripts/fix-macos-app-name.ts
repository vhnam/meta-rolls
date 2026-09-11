import {
  copyFileSync,
  existsSync,
  readFileSync,
  renameSync,
  utimesSync,
  writeFileSync
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pkg from '../package.json' with { type: 'json' };

const BUNDLE_ID = 'com.electron.meta-rolls';
const LSREGISTER =
  '/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister';

function setPlistString(plist: string, key: string, value: string): string {
  const pattern = new RegExp(`(<key>${key}</key>\\s*<string>)([^<]*)(</string>)`);
  if (!pattern.test(plist)) {
    throw new Error(`Missing ${key} in Electron Info.plist`);
  }
  return plist.replace(pattern, `$1${value}$3`);
}

export function fixMacosAppName(): void {
  if (process.platform !== 'darwin') {
    return;
  }

  const appName = pkg.productName;
  const require = createRequire(import.meta.url);
  const electronPkgDir = dirname(require.resolve('electron'));
  const pathTxt = join(electronPkgDir, 'path.txt');
  let electronBinary = require('electron') as string;
  let appBundle = join(dirname(electronBinary), '../..');
  const distDir = dirname(appBundle);
  const desiredApp = `${appName}.app`;
  const desiredBundle = join(distDir, desiredApp);

  if (basename(appBundle) !== desiredApp && existsSync(appBundle)) {
    if (existsSync(desiredBundle)) {
      appBundle = desiredBundle;
      writeFileSync(pathTxt, `${desiredApp}/Contents/MacOS/Electron`);
    } else {
      try {
        renameSync(appBundle, desiredBundle);
        appBundle = desiredBundle;
        writeFileSync(pathTxt, `${desiredApp}/Contents/MacOS/Electron`);
      } catch {
        // Bundle is in use (dev Electron still running). Retry on the next start.
      }
    }
  }

  const plistPath = join(appBundle, 'Contents/Info.plist');
  if (!existsSync(plistPath)) {
    return;
  }

  let plist = readFileSync(plistPath, 'utf8');
  plist = setPlistString(plist, 'CFBundleName', appName);
  plist = setPlistString(plist, 'CFBundleDisplayName', appName);
  plist = setPlistString(plist, 'CFBundleIdentifier', BUNDLE_ID);
  writeFileSync(plistPath, plist);

  const iconSource = join(process.cwd(), 'build/icon.icns');
  const iconDest = join(appBundle, 'Contents/Resources/electron.icns');
  if (existsSync(iconSource)) {
    copyFileSync(iconSource, iconDest);
  }

  const now = new Date();
  utimesSync(appBundle, now, now);

  if (existsSync(LSREGISTER)) {
    spawnSync(LSREGISTER, ['-f', appBundle], { stdio: 'ignore' });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  fixMacosAppName();
}
