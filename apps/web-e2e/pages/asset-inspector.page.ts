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
        body: 'Select a physical component in the synthetic topology to review its attributed sample evidence and source.',
      },
      () => target.click(),
    );
  }

  playbackReading(label: string): Locator {
    return this.playback.getByRole('article').filter({
      has: this.page.getByRole('heading', { name: label, exact: true }),
    });
  }

  historyPlot(label: string): Locator {
    return this.componentEvidence.getByRole('article').filter({
      has: this.page.getByRole('img', {
        name: `Sample history for ${label}; table follows`,
      }),
    });
  }

  async chooseHistoryWindow(window: '1h' | '6h' | '24h'): Promise<void> {
    const target = this.componentEvidence
      .getByRole('group', { name: 'History window' })
      .getByRole('button', { name: window });
    await performDocumentedAction(
      this.narrator,
      target,
      {
        title: `Review ${window} of sample history`,
        body: 'Change the synthetic signal-history window. The chart and table share a fixed sample cutoff, and gaps remain missing evidence.',
      },
      () => target.click(),
    );
  }

  async showReadingsTable(label: string): Promise<void> {
    const target = this.historyPlot(label).getByText(
      'View readings as a table',
    );
    await performDocumentedAction(
      this.narrator,
      target,
      {
        title: `Read ${label} history as a table`,
        body: 'Open the accessible table for the synthetic history. A gap is recorded as a gap, never interpolated into a value.',
      },
      () => target.click(),
    );
  }

  async showTab(name: 'Overview' | 'Details' | 'Events'): Promise<void> {
    const target = this.componentEvidence.getByRole('tab', { name });
    await performDocumentedAction(
      this.narrator,
      target,
      {
        title: `Open ${name.toLowerCase()} for this component`,
        body: 'Switch the sample inspector section while keeping the selected physical component and its URL-backed context.',
      },
      () => target.click(),
    );
  }

  async startPlayback(): Promise<void> {
    const target = this.playback.getByRole('button', {
      name: 'Play',
      exact: true,
    });
    await performDocumentedAction(
      this.narrator,
      target,
      {
        title: 'Play a synthetic signal sequence',
        body: 'Rehearse invented stream events and recovery states. This simulation does not change the fixed sample snapshot or make the readings live.',
      },
      () => target.click(),
    );
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

  async documentTopology(): Promise<void> {
    await documentResult(this.narrator, this.topology, {
      title: 'Navigate the physical identities',
      body: 'This synthetic topology separates the locomotive, its components, and the telemetry gateway. A selected node determines which sample evidence is attributed.',
    });
  }

  async documentEvidence(): Promise<void> {
    await documentResult(this.narrator, this.componentEvidence, {
      title: 'Read component evidence in context',
      body: 'The synthetic component snapshot shows readings, units, an illustrative reference band when available, event and receive times, and disclosed history gaps.',
    });
    await documentResult(this.narrator, this.context, {
      title: 'Check the sample source and attribution',
      body: 'Synthetic provenance identifies the source endpoint, protocol package, binding revision, target property, timing, and unresolved signals.',
    });
  }

  async documentPlayback(): Promise<void> {
    await documentResult(this.narrator, this.playback, {
      title: 'Inspect the completed synthetic playback',
      body: 'The invented sequence can end with stale readings or missing evidence. Its status describes a simulation, while the fixed sample history stays unchanged.',
    });
  }

  async documentMissingEvidence(): Promise<void> {
    await documentResult(this.narrator, this.componentEvidence, {
      title: 'Treat missing evidence as unknown',
      body: 'This selected sample component has no attributed reading. The inspector does not replace missing telemetry with zero or a guessed value.',
    });
    await documentResult(this.narrator, this.context, {
      title: 'Check attribution before acting',
      body: 'The synthetic context explicitly says when no attributed signal source is available for the selected physical identity.',
    });
  }
}
