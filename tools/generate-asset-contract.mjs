import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const specPath = fileURLToPath(
  new URL(
    '../contracts/http/fleetiq-v1-ui-baseline.openapi.json',
    import.meta.url,
  ),
);
const outputPath = fileURLToPath(
  new URL('../apps/web/src/generated/fleetiq-api.ts', import.meta.url),
);
const generatorPath = fileURLToPath(
  new URL(
    '../node_modules/@effect/openapi-generator/dist/bin.js',
    import.meta.url,
  ),
);

// Invoke the pinned generator without shell redirection, so Windows and CI write
// exactly the same UTF-8 bytes. Stderr warnings indicate incomplete generation.
const result = spawnSync(
  process.execPath,
  [
    generatorPath,
    '--spec',
    specPath,
    '--name',
    'FleetIqApi',
    '--format',
    'httpclient',
  ],
  { cwd: repoRoot, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 },
);
if (result.error || result.status !== 0) {
  throw new Error(
    'Effect OpenAPI generation failed: ' +
      (result.error?.message ?? result.stderr ?? 'unknown error'),
  );
}
if (result.stderr.trim()) {
  throw new Error(`Effect OpenAPI generation warned: ${result.stderr}`);
}
if (!result.stdout.includes('export const AssetPage =')) {
  throw new Error('Generated contract has no AssetPage schema');
}

if (process.argv.includes('--check')) {
  const committed = await readFile(outputPath, 'utf8');
  if (committed !== result.stdout) {
    throw new Error(
      'Generated FleetIQ HTTP contract is stale; run pnpm contract:generate',
    );
  }
  console.log('Generated FleetIQ HTTP contract matches pinned OpenAPI');
} else {
  await writeFile(outputPath, result.stdout, 'utf8');
  console.log('Generated FleetIQ HTTP contract from pinned OpenAPI');
}
