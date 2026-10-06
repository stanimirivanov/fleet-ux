import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const outputRoot = path.resolve(repoRoot, 'dist/user-guide');

// This command deletes generated output. Keep that target fixed inside this repo.
if (outputRoot !== path.join(path.resolve(repoRoot), 'dist', 'user-guide')) {
  throw new Error(
    'Guide output must remain inside the repository dist directory.',
  );
}

const run = (label, command, args, environment = process.env) => {
  console.log(`\n${label}`);
  // Windows needs cmd.exe to launch pnpm.cmd; pass fixed command tokens
  // directly without shell:true's deprecated argument concatenation.
  const windowsPnpm = process.platform === 'win32' && command === 'pnpm';
  const result = spawnSync(
    windowsPnpm ? (process.env.ComSpec ?? 'cmd.exe') : command,
    windowsPnpm ? ['/d', '/s', '/c', command, ...args] : args,
    { cwd: repoRoot, env: environment, stdio: 'inherit' },
  );
  if (result.error !== undefined || result.status !== 0) {
    throw new Error(
      `${label} failed: ${result.error?.message ?? `exit ${result.status}`}`,
    );
  }
};

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

try {
  run('Building the application for guide verification', 'pnpm', ['build']);
  run(
    'Recording tagged Playwright guides',
    'pnpm',
    [
      'exec',
      'playwright',
      'test',
      '--config',
      'apps/web-e2e/playwright.config.ts',
      '--grep',
      '@user-guide',
    ],
    { ...process.env, FLEETIQ_E2E_MODE: 'user-guide' },
  );
  run('Assembling the user-guide book', process.execPath, [
    fileURLToPath(new URL('./assemble-book.mjs', import.meta.url)),
  ]);
  console.log('\n[ok] User guide generated under dist/user-guide');
} catch (error) {
  // Never leave a partial book that could be mistaken for verified output.
  rmSync(outputRoot, { recursive: true, force: true });
  console.error(error);
  process.exitCode = 1;
}
