import { spawn, type ChildProcess } from 'child_process';
import { createServer, build } from 'vite';
import electronPath from 'electron';
import { fixMacosAppName } from './fix-macos-app-name';

type RolldownWatcher = Extract<Awaited<ReturnType<typeof build>>, { close: () => Promise<void> }>;

let electronProcess: ChildProcess | null = null;

function startElectron(rendererUrl: string): void {
  electronProcess?.removeAllListeners();
  electronProcess?.kill();

  const env: NodeJS.ProcessEnv = { ...process.env, ELECTRON_RENDERER_URL: rendererUrl };
  delete env.ELECTRON_RUN_AS_NODE;

  electronProcess = spawn(String(electronPath), ['.'], { stdio: 'inherit', env });

  electronProcess.on('exit', (code) => {
    if (code !== null) process.exit(code);
  });
}

async function watchProcess(configFile: string, onRebuild: () => void): Promise<void> {
  const watcher = (await build({
    configFile,
    build: { watch: {} }
  })) as RolldownWatcher;

  watcher.on('event', (event) => {
    if (event.code === 'BUNDLE_END') onRebuild();
  });
}

async function main(): Promise<void> {
  fixMacosAppName();

  const rendererServer = await createServer({ configFile: 'vite.config.mts' });
  await rendererServer.listen();
  const rendererUrl = rendererServer.resolvedUrls!.local[0];

  let mainReady = false;
  let preloadReady = false;
  const restart = (): void => {
    if (mainReady && preloadReady) startElectron(rendererUrl);
  };

  await watchProcess('vite.preload.config.mts', () => {
    preloadReady = true;
    restart();
  });
  await watchProcess('vite.main.config.mts', () => {
    mainReady = true;
    restart();
  });
}

main();
