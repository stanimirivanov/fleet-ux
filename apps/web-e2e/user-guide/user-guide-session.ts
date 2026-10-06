import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  Browser,
  BrowserContext,
  Locator,
  Page,
  Video,
} from '@playwright/test';
import { browserScenarioMode } from './guide-mode';
import type { GuideNarrator, GuideStepDefinition } from './guide-narrator';

interface GuideDefinition {
  readonly order: number;
  readonly slug: string;
  readonly summary: string;
  readonly title: string;
}

export interface StartGuideOptions extends GuideDefinition {
  readonly baseURL: string;
}

interface RecordedStep extends GuideStepDefinition {
  readonly image: string;
}

const guideOutputRoot = fileURLToPath(
  new URL('../../../dist/user-guide/', import.meta.url),
);
const guideViewport = { width: 1440, height: 900 } as const;
const safeSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Owns one browser journey and its optional recording. Test-only mode uses the
 * same page objects and assertions without writing guide output or adding delays.
 */
export class UserGuideSession implements GuideNarrator {
  readonly page: Page;

  private readonly context: BrowserContext;
  private readonly definition: GuideDefinition;
  private readonly directory: string;
  private readonly recordsGuide: boolean;
  private readonly video: Video | null;
  private readonly steps: RecordedStep[] = [];
  private closed = false;

  private constructor(
    context: BrowserContext,
    page: Page,
    definition: GuideDefinition,
    recordsGuide: boolean,
  ) {
    this.context = context;
    this.page = page;
    this.definition = definition;
    this.directory = path.join(guideOutputRoot, definition.slug);
    this.recordsGuide = recordsGuide;
    this.video = page.video();
  }

  static async start(
    browser: Browser,
    options: StartGuideOptions,
  ): Promise<UserGuideSession> {
    // Validate before joining or deleting any filesystem path supplied by a test.
    if (!safeSlug.test(options.slug)) {
      throw new Error(
        'Guide slug must use lowercase words separated by hyphens.',
      );
    }
    if (!Number.isSafeInteger(options.order) || options.order < 0) {
      throw new Error('Guide order must be a non-negative integer.');
    }
    if (!options.title.trim() || !options.summary.trim()) {
      throw new Error('Guide title and summary must be non-empty.');
    }

    const recordsGuide = browserScenarioMode() === 'user-guide';
    const directory = path.join(guideOutputRoot, options.slug);
    if (recordsGuide) {
      await rm(directory, { recursive: true, force: true });
      await mkdir(path.join(directory, 'assets'), { recursive: true });
    }

    const context = await browser.newContext({
      baseURL: options.baseURL,
      colorScheme: 'light',
      locale: 'en-US',
      reducedMotion: 'reduce',
      timezoneId: 'UTC',
      viewport: guideViewport,
      ...(recordsGuide
        ? {
            recordVideo: {
              dir: path.join(directory, 'assets'),
              size: guideViewport,
            },
          }
        : {}),
    });
    const page = await context.newPage();
    return new UserGuideSession(
      context,
      page,
      {
        order: options.order,
        slug: options.slug,
        summary: options.summary,
        title: options.title,
      },
      recordsGuide,
    );
  }

  async action(
    target: Locator,
    step: GuideStepDefinition,
    perform: () => Promise<void>,
  ): Promise<void> {
    if (!this.recordsGuide) {
      await perform();
      return;
    }

    await this.showAnnotation(target, step.body);
    // This dwell is narration time in the recording, never test synchronization.
    await this.page.waitForTimeout(700);
    await this.captureStep(step);
    await perform();
    await this.page.mouse.move(
      guideViewport.width / 2,
      guideViewport.height / 2,
    );
    await this.page.waitForTimeout(1_200);
    await this.clearAnnotation();
  }

  async result(target: Locator, step: GuideStepDefinition): Promise<void> {
    if (!this.recordsGuide) {
      return;
    }

    await this.showAnnotation(target, step.body);
    await this.captureStep(step);
    await this.page.waitForTimeout(1_500);
    await this.clearAnnotation();
  }

  async finish(): Promise<void> {
    await this.closeContext();
    if (!this.recordsGuide) {
      return;
    }
    if (this.steps.length === 0 || this.video === null) {
      throw new Error(
        'A recorded guide needs at least one step and a Playwright video.',
      );
    }

    const videoName = `${this.definition.slug}.webm`;
    await rename(
      await this.video.path(),
      path.join(this.directory, 'assets', videoName),
    );
    await writeFile(
      path.join(this.directory, 'guide.json'),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          ...this.definition,
          steps: this.steps,
          video: `assets/${videoName}`,
        },
        undefined,
        2,
      )}\n`,
      'utf8',
    );
  }

  async abort(): Promise<void> {
    await this.closeContext();
    if (this.recordsGuide) {
      await rm(this.directory, { recursive: true, force: true });
    }
  }

  private async captureStep(step: GuideStepDefinition): Promise<void> {
    const image = `assets/step-${String(this.steps.length + 1).padStart(2, '0')}.png`;
    await this.page.screenshot({
      animations: 'disabled',
      path: path.join(this.directory, image),
    });
    this.steps.push({ ...step, image });
  }

  private async showAnnotation(target: Locator, body: string): Promise<void> {
    await target.scrollIntoViewIfNeeded();
    const box = await target.boundingBox();
    if (box === null) {
      throw new Error('Cannot annotate a guide target that is not visible.');
    }
    await this.clearAnnotation();
    await this.page.evaluate(
      ({ targetBox, text }) => {
        const layer = document.createElement('div');
        layer.dataset.fleetiqGuideAnnotation = 'true';
        layer.style.cssText =
          'position:fixed;inset:0;pointer-events:none;z-index:2147483647';

        const highlight = document.createElement('div');
        highlight.style.cssText =
          'position:fixed;border:3px solid #d4a72c;border-radius:8px;box-shadow:0 0 0 4px rgba(212,167,44,.24)';
        highlight.style.left = `${Math.max(4, targetBox.x - 4)}px`;
        highlight.style.top = `${Math.max(4, targetBox.y - 4)}px`;
        highlight.style.width = `${targetBox.width + 8}px`;
        highlight.style.height = `${targetBox.height + 8}px`;

        const note = document.createElement('div');
        note.setAttribute('role', 'note');
        note.textContent = text;
        note.style.cssText =
          'position:fixed;max-width:360px;padding:14px 16px;background:#241a2e;color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.32);font:600 16px/1.45 system-ui,sans-serif';
        note.style.left = `${Math.min(Math.max(12, targetBox.x), window.innerWidth - 372)}px`;
        note.style.top = `${Math.min(targetBox.y + targetBox.height + 16, window.innerHeight - 120)}px`;
        layer.append(highlight, note);
        document.body.append(layer);
      },
      { targetBox: box, text: body },
    );
  }

  private async clearAnnotation(): Promise<void> {
    if (this.page.isClosed()) {
      return;
    }
    await this.page
      .locator('[data-fleetiq-guide-annotation="true"]')
      .evaluateAll((annotations) => {
        for (const annotation of annotations) annotation.remove();
      });
  }

  private async closeContext(): Promise<void> {
    if (this.closed) {
      return;
    }
    await this.clearAnnotation();
    await this.context.close();
    this.closed = true;
  }
}
