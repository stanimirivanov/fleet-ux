import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  analyzeView,
  countProductionLines,
  isPageOrView,
  MAX_VIEW_LINES,
} from './check-view-size.mjs';

test('only hand-written page and root-view names are guarded', () => {
  assert.equal(isPageOrView('AppShell.tsx'), true);
  assert.equal(isPageOrView('AssetsPage.tsx'), true);
  assert.equal(isPageOrView('WorkspacePages.tsx'), true);
  assert.equal(isPageOrView('AssetCatalogueView.tsx'), true);
  assert.equal(isPageOrView('AssetCard.tsx'), false);
  assert.equal(isPageOrView('AssetsPage.test.tsx'), false);
});

test('blank and standalone comment lines do not inflate the production count', () => {
  assert.equal(
    countProductionLines(
      '/* explanation\ncontinues */\n// note\n\nexport function Page() {\n  return <div />;\n}\n',
    ),
    3,
  );
});

test('a page at the threshold passes and one above it is reported', () => {
  const atLimit = 'const entry = 1;\n'.repeat(MAX_VIEW_LINES);
  const overLimit = `${atLimit}const extra = 2;\n`;
  assert.equal(analyzeView('AssetsPage.tsx', atLimit)?.error, null);
  assert.match(
    analyzeView('AssetsPage.tsx', overLimit)?.error ?? '',
    /exceeds 150/,
  );
});

test('a substantial early rationale is the narrow exception', () => {
  const oversized = 'const entry = 1;\n'.repeat(MAX_VIEW_LINES + 1);
  const short = `// view-size-exception: cohesive\n${oversized}`;
  const reviewed =
    '// view-size-exception: A cohesive vector canvas uses a single owner for rendering and teardown.\n' +
    oversized;
  assert.match(analyzeView('AppShell.tsx', short)?.error ?? '', /exceeds 150/);
  assert.equal(analyzeView('AppShell.tsx', reviewed)?.error, null);
  assert.match(
    analyzeView('AppShell.tsx', reviewed)?.exception ?? '',
    /single owner/,
  );
});
