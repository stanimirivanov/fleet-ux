import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const MAX_VIEW_LINES = 150;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'apps/web/src');
const exceptionPrefix = '// view-size-exception: ';

/** Page and root views carry the orchestration limit; ordinary leaf components do not. */
export function isPageOrView(file) {
  const name = path.basename(file);
  return (
    (!name.endsWith('.test.tsx') && /(?:Page|Pages|View)\.tsx$/u.test(name)) ||
    name === 'AppShell.tsx'
  );
}

/** Count nonblank source lines, omitting standalone line and block comments. */
export function countProductionLines(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//gu, '')
    .split(/\r?\n/u)
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('//');
    }).length;
}

export function analyzeView(file, source) {
  if (!isPageOrView(file)) return null;
  const lines = countProductionLines(source);
  if (lines <= MAX_VIEW_LINES) return { file, lines, error: null };

  const exception = source
    .split(/\r?\n/u)
    .slice(0, 20)
    .map((line) => line.trim())
    .find((line) => line.startsWith(exceptionPrefix));
  const rationale = exception?.slice(exceptionPrefix.length).trim() ?? '';
  if (rationale.length >= 40) {
    return { file, lines, error: null, exception: rationale };
  }

  return {
    file,
    lines,
    error:
      'Page/view exceeds 150 production lines. Split orchestration, interaction, and presentation; or add a reviewed view-size-exception rationale in the first 20 lines.',
  };
}

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(target);
      return entry.isFile() && isPageOrView(target) ? [target] : [];
    })
    .sort();
}

export function checkViews() {
  return sourceFiles(sourceRoot)
    .map((file) =>
      analyzeView(path.relative(root, file), readFileSync(file, 'utf8')),
    )
    .filter(Boolean);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const results = checkViews();
  for (const result of results) {
    if (result.error) {
      console.error(
        result.file +
          ': ' +
          result.lines +
          ' production lines. ' +
          result.error,
      );
    } else if (result.exception) {
      console.warn(
        result.file +
          ': reviewed size exception (' +
          result.lines +
          ' lines): ' +
          result.exception,
      );
    }
  }
  if (results.some((result) => result.error)) {
    process.exitCode = 1;
  } else {
    console.log(
      `Page and root view size policy passed (${results.length} files).`,
    );
  }
}
