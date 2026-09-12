import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

if (process.platform !== 'darwin') {
  console.info('App icon generation requires macOS (sips + iconutil).');
  process.exit(0);
}

const ROOT = process.cwd();
const SOURCE = join(ROOT, 'resources/icon.png');
const ICONSET = join(ROOT, 'build/icon.iconset');

const SIZES = [
  ['icon_16x16.png', 16],
  ['icon_16x16@2x.png', 32],
  ['icon_32x32.png', 32],
  ['icon_32x32@2x.png', 64],
  ['icon_128x128.png', 128],
  ['icon_128x128@2x.png', 256],
  ['icon_256x256.png', 256],
  ['icon_256x256@2x.png', 512],
  ['icon_512x512.png', 512],
  ['icon_512x512@2x.png', 1024]
] as const;

const run = (command: string, args: string[]) => {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed`);
  }
};

rmSync(ICONSET, { recursive: true, force: true });
mkdirSync(ICONSET, { recursive: true });

for (const [name, size] of SIZES) {
  run('sips', ['-z', String(size), String(size), SOURCE, '--out', join(ICONSET, name)]);
}

run('iconutil', ['-c', 'icns', ICONSET, '-o', join(ROOT, 'build/icon.icns')]);
run('sips', ['-z', '1024', '1024', SOURCE, '--out', join(ROOT, 'build/icon.png')]);
rmSync(ICONSET, { recursive: true, force: true });
