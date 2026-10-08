import type { Locator, Page } from '@playwright/test';
import {
  documentResult,
  type GuideNarrator,
  performDocumentedAction,
} from '../user-guide/guide-narrator';

/**
 * Asset identity, topology, and evidence locators remain stable as the selected
 * component changes through URL state.
 */
export class AssetInspectorPage {
  readonly heading: Locator;
  readonly connectionNotice: Locator;
  readonly topology: Locator;
  readonly componentEvidence: Locator;
  readonly context: Locator;
  readonly playback: Locator;

  constructor(
    private readonly page: Page,
    private readonly narrator?: GuideNarrator,
  ) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.connectionNotice = page.getByRole('region', {
      name: 'Asset inspector is not connected',
    });
    this.topology = page.getByRole('region', { name: 'Asset topology' });
    this.componentEvidence = page.getByRole('region', {
      name: 'Component evidence',
    });
    this.context = page.getByRole('region', {
      name: 'Evidence and context',
    });
    this.playback = page.getByRole('region', {
      name: 'Synthetic signal playback',
    });
  }

  async openSample(assetId: string): Promise<void> {
    await this.page.goto(`/assets/${assetId}?preview=sample`);
    // Vite may still be transforming the lazy inspector chunk after navigation.
    await this.heading.waitFor({ state: 'visible', timeout: 20_000 });
    await this.topology.waitFor({ state: 'visible', timeout: 20_000 });
  }

  node(name: string): Locator {
    return this.topology.getByRole('button', { name, exact: true });
  }

  async selectNode(name: string): Promise<void> {
    const target = this.node(name);
    await performDocumentedAction(
      this.narrator,
      target,
      {
        title: `Inspect ${name}`,
        body: 'Select a physical component in the asset topology to review its attributed evidence and source.',
      },
      () => target.click(),
    );
  }

  playbackReading(label: string): Locator {
    return this.playback.getByRole('article').filter({
      has: this.page.getByRole('heading', { name: label, exact: true }),
    });
  }

  async startPlayback(): Promise<void> {
    await this.playback
      .getByRole('button', { name: 'Play', exact: true })
      .click();
  }

  async stopPlayback(): Promise<void> {
    await this.playback
      .getByRole('button', { name: 'Stop', exact: true })
      .click();
  }

  async replay(): Promise<void> {
    await this.playback
      .getByRole('button', { name: 'Replay', exact: true })
      .click();
  }

  async documentEvidence(): Promise<void> {
    await documentResult(this.narrator, this.componentEvidence, {
      title: 'Read component evidence in context',
      body: 'The selected component shows its reading, unit, reference band when available, event and receive times, and a history with gaps disclosed.',
    });
    await documentResult(this.narrator, this.context, {
      title: 'Check the source and attribution',
      body: 'Evidence context identifies the source endpoint, quality, mapping revision, and unresolved signals. Sample data is explicitly labelled.',
    });
  }
}
