import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { assembleBook } from './assemble-book.mjs';

const chapters = [
  ['console-orientation', 'production-shell', 10],
  ['fleet-overview', 'development-sample', 20],
  ['map-workbench', 'development-sample', 30],
  ['asset-inspector', 'development-sample', 40],
  ['registry-review', 'development-sample', 50],
  ['alert-triage', 'development-sample', 60],
];

const createFixture = async (context) => {
  const root = await mkdtemp(path.join(tmpdir(), 'fleetiq-guide-'));
  context.after(async () => {
    const resolved = path.resolve(root);
    if (!resolved.startsWith(`${path.resolve(tmpdir())}${path.sep}`)) {
      throw new Error(
        'Refusing to remove a guide fixture outside the temp directory.',
      );
    }
    await rm(root, { recursive: true, force: true });
  });

  for (const [slug, dataMode, order] of chapters) {
    const directory = path.join(root, slug);
    const assets = path.join(directory, 'assets');
    await mkdir(assets, { recursive: true });
    await writeFile(path.join(assets, `${slug}.webm`), '');
    const steps = [];
    for (let index = 1; index <= 5; index += 1) {
      const image = `assets/step-${String(index).padStart(2, '0')}.png`;
      await writeFile(path.join(directory, image), '');
      steps.push({
        title: `Step ${index}`,
        body: `Verified action ${index}.`,
        image,
      });
    }
    await writeFile(
      path.join(directory, 'guide.json'),
      JSON.stringify({
        schemaVersion: 2,
        dataMode,
        order,
        slug,
        title: slug,
        summary: 'A verified browser journey.',
        video: `assets/${slug}.webm`,
        steps,
      }),
    );
  }
  return root;
};

test('assembles distinct production and synthetic guide sections', async (context) => {
  const root = await createFixture(context);
  await assembleBook(root);

  const home = await readFile(path.join(root, 'index.html'), 'utf8');
  const index = await readFile(path.join(root, 'README.md'), 'utf8');
  const sample = await readFile(
    path.join(root, 'map-workbench', 'index.html'),
    'utf8',
  );
  const sampleMarkdown = await readFile(
    path.join(root, 'map-workbench', 'README.md'),
    'utf8',
  );
  const production = await readFile(
    path.join(root, 'console-orientation', 'index.html'),
    'utf8',
  );

  assert.match(home, /Production console orientation/);
  assert.match(home, /Explore sample workflows/);
  assert.match(home, /synthetic data/);
  assert.match(index, /Development-sample chapters use synthetic data/);
  assert.match(sample, /The assets, telemetry/);
  assert.match(sampleMarkdown, /do not demonstrate live fleet operations/);
  assert.match(production, /mode-note--production-shell/);
  assert.doesNotMatch(production, /mode-note--development-sample/);
});

test('rejects a required chapter with the wrong data mode', async (context) => {
  const root = await createFixture(context);
  const manifest = path.join(root, 'registry-review', 'guide.json');
  const value = JSON.parse(await readFile(manifest, 'utf8'));
  value.dataMode = 'production-shell';
  await writeFile(manifest, JSON.stringify(value));

  await assert.rejects(
    assembleBook(root),
    /registry-review must use dataMode development-sample/,
  );
});

test('rejects an incomplete set of planned screen journeys', async (context) => {
  const root = await createFixture(context);
  const missing = path.join(root, 'alert-triage');
  if (!missing.startsWith(`${path.resolve(root)}${path.sep}`)) {
    throw new Error('Refusing to remove a guide fixture outside its root.');
  }
  await rm(missing, { recursive: true, force: true });

  await assert.rejects(assembleBook(root), /chapter is missing: alert-triage/);
});
