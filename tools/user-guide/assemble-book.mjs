import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const outputRoot = fileURLToPath(
  new URL('../../dist/user-guide/', import.meta.url),
);
const stylesheet = fileURLToPath(
  new URL('./assets/guide.css', import.meta.url),
);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const assetPattern = /^assets\/[a-z0-9][a-z0-9.-]*\.(?:png|webm)$/;

const fail = (manifest, reason) => {
  throw new Error(`Invalid guide manifest ${manifest}: ${reason}`);
};

const requiredText = (value, field, manifest) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail(manifest, `${field} must be non-empty text`);
  }
  return value.trim();
};

const asset = async (value, field, manifest) => {
  const relative = requiredText(value, field, manifest);
  if (
    !assetPattern.test(relative) ||
    !relative.endsWith(field === 'video' ? '.webm' : '.png')
  ) {
    fail(manifest, `${field} must be an assets/ PNG or WebM path`);
  }
  const file = path.join(path.dirname(manifest), relative);
  try {
    if (!(await stat(file)).isFile())
      fail(manifest, `${field} must identify a file`);
  } catch (error) {
    if (error?.code === 'ENOENT')
      fail(manifest, `${field} does not exist: ${relative}`);
    throw error;
  }
  return relative;
};

const parseManifest = async (directory) => {
  const manifest = path.join(outputRoot, directory, 'guide.json');
  const value = JSON.parse(await readFile(manifest, 'utf8'));
  if (
    value === null ||
    typeof value !== 'object' ||
    value.schemaVersion !== 1
  ) {
    fail(manifest, 'expected schemaVersion 1 object');
  }
  if (!Number.isSafeInteger(value.order) || value.order < 0) {
    fail(manifest, 'order must be a non-negative integer');
  }
  const slug = requiredText(value.slug, 'slug', manifest);
  if (!slugPattern.test(slug) || slug !== directory) {
    fail(manifest, 'slug must match its safe directory name');
  }
  if (!Array.isArray(value.steps) || value.steps.length < 5) {
    fail(manifest, 'a useful guide must have at least five documented steps');
  }

  const steps = await Promise.all(
    value.steps.map(async (step, index) => {
      if (step === null || typeof step !== 'object') {
        fail(manifest, `steps[${index}] must be an object`);
      }
      return {
        title: requiredText(step.title, `steps[${index}].title`, manifest),
        body: requiredText(step.body, `steps[${index}].body`, manifest),
        image: await asset(step.image, `steps[${index}].image`, manifest),
      };
    }),
  );
  return {
    slug,
    order: value.order,
    title: requiredText(value.title, 'title', manifest),
    summary: requiredText(value.summary, 'summary', manifest),
    video: await asset(value.video, 'video', manifest),
    steps,
  };
};

const escapeHtml = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const htmlDocument = (
  title,
  description,
  home,
  navigation,
  content,
  css,
) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)} · FleetIQ User Guide</title>
  <link rel="stylesheet" href="${css}">
</head>
<body>
  <a class="skip" href="#content">Skip to content</a>
  <header><a class="brand" href="${home}"><span class="mark">FI</span> FleetIQ User Guide</a></header>
  <div class="layout">
    <nav aria-label="Guide chapters"><p class="nav-label">Guides</p><ol>${navigation}</ol></nav>
    <main id="content">${content}</main>
  </div>
  <footer>Generated from verified Playwright journeys.</footer>
</body>
</html>
`;

const navigation = (guides, current, nested) =>
  guides
    .map((guide) => {
      const href = nested ? `../${guide.slug}/` : `./${guide.slug}/`;
      const selected = guide.slug === current ? ' aria-current="page"' : '';
      return `<li><a href="${href}"${selected}>${escapeHtml(guide.title)}</a></li>`;
    })
    .join('\n');

const markdownPage = (guide) =>
  `# ${guide.title}\n\n${guide.summary}\n\n<video controls poster="./${guide.steps[0].image}" src="./${guide.video}">Your browser does not support video.</video>\n\n${guide.steps.map((step, index) => `## ${index + 1}. ${step.title}\n\n${step.body}\n\n![${step.title}](./${step.image})`).join('\n\n')}\n`;

const chapterPage = (guide, guides) => {
  const steps = guide.steps
    .map(
      (step, index) => `<section class="step" id="step-${index + 1}">
  <p class="step-number">Step ${index + 1}</p>
  <h2>${escapeHtml(step.title)}</h2>
  <p>${escapeHtml(step.body)}</p>
  <img src="./${step.image}" alt="${escapeHtml(step.title)}" loading="lazy">
</section>`,
    )
    .join('\n');
  return htmlDocument(
    guide.title,
    guide.summary,
    '../',
    navigation(guides, guide.slug, true),
    `<article>
  <p class="eyebrow">Executable guide</p>
  <h1>${escapeHtml(guide.title)}</h1>
  <p class="lead">${escapeHtml(guide.summary)}</p>
  <video controls preload="metadata" poster="./${guide.steps[0].image}"><source src="./${guide.video}" type="video/webm">Your browser does not support video.</video>
  ${steps}
</article>`,
    '../assets/guide.css',
  );
};

const entries = await readdir(outputRoot, { withFileTypes: true });
const guideDirectories = entries.filter(
  (entry) => entry.isDirectory() && entry.name !== 'assets',
);
const guides = await Promise.all(
  guideDirectories.map((entry) => parseManifest(entry.name)),
);
if (guides.length === 0)
  throw new Error('No verified guide manifests were generated.');
guides.sort(
  (left, right) =>
    left.order - right.order || left.title.localeCompare(right.title),
);

for (const guide of guides) {
  await writeFile(
    path.join(outputRoot, guide.slug, 'README.md'),
    markdownPage(guide),
    'utf8',
  );
  await writeFile(
    path.join(outputRoot, guide.slug, 'index.html'),
    chapterPage(guide, guides),
    'utf8',
  );
}

const cards = guides
  .map(
    (guide) =>
      `<li><a class="card" href="./${guide.slug}/"><strong>${escapeHtml(guide.title)}</strong><span>${escapeHtml(guide.summary)}</span></a></li>`,
  )
  .join('\n');
await writeFile(
  path.join(outputRoot, 'README.md'),
  `# FleetIQ User Guide\n\nThis guide is generated from verified Playwright journeys.\n\n${guides.map((guide) => `- [${guide.title}](./${guide.slug}/README.md)`).join('\n')}\n`,
  'utf8',
);
await mkdir(path.join(outputRoot, 'assets'), { recursive: true });
await copyFile(stylesheet, path.join(outputRoot, 'assets', 'guide.css'));
await writeFile(
  path.join(outputRoot, 'index.html'),
  htmlDocument(
    'Home',
    'Executable guides for FleetIQ operator journeys.',
    './',
    navigation(guides, undefined, false),
    `<section><p class="eyebrow">FleetIQ documentation</p><h1>Learn through verified journeys</h1><p class="lead">Each guide follows a tested workflow and includes annotated steps and a recording.</p><ol class="cards">${cards}</ol></section>`,
    './assets/guide.css',
  ),
  'utf8',
);

console.log(
  `[ok] Assembled ${guides.length} guide chapter(s) as Markdown and static HTML`,
);
