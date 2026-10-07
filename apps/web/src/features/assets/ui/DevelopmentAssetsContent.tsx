import { useLocation } from '@solidjs/router';
import { createMemo, type JSX, Show } from 'solid-js';
import { ButtonLink, TextLink } from '#shared/ui';
import {
  assetSamplePreviewHref,
  isAssetSamplePreview,
  readAssetPreviewCursor,
  registrySampleHref,
} from '../model/asset-preview-url';
import DevelopmentAssetCatalogue from './DevelopmentAssetCatalogue';

/** Explicit URL opt-in; this whole module is excluded from production builds. */
export default function DevelopmentAssetsContent(props: {
  readonly connectionNotice: JSX.Element;
}) {
  const location = useLocation();
  const showingSample = () =>
    isAssetSamplePreview(location.pathname, location.search);
  const cursor = createMemo(() => readAssetPreviewCursor(location.search));
  const after = () => {
    const current = cursor();
    return current.kind === 'page' ? current.after : undefined;
  };

  return (
    <Show
      when={showingSample()}
      fallback={
        <div class="grid max-w-3xl gap-4">
          {props.connectionNotice}
          <TextLink href={assetSamplePreviewHref()}>
            View sample catalogue
          </TextLink>
        </div>
      }
    >
      <section
        aria-labelledby="sample-catalogue-heading"
        class="rounded-panel border border-outline bg-surface p-6 sm:p-8"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="inline-flex rounded-full border border-outline bg-canvas px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-foreground">
              Sample data
            </p>
            <h2
              id="sample-catalogue-heading"
              class="mt-4 text-xl font-semibold"
            >
              Sample asset catalogue
            </h2>
            <p class="mt-2 max-w-2xl text-sm leading-7 text-muted">
              Synthetic records for development tenant tenant-a. These are local
              examples, not connected fleet data.
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <TextLink href={registrySampleHref()}>
              Review sample registry
            </TextLink>
            <TextLink href="/assets">Exit sample</TextLink>
          </div>
        </div>
        <Show
          when={cursor().kind !== 'invalid'}
          fallback={
            <div role="alert" class="mt-6 rounded-lg border border-outline p-5">
              <h3 class="text-base font-semibold">Invalid sample cursor</h3>
              <p class="mt-2 text-sm leading-6 text-muted">
                This address cannot select a catalogue page.
              </p>
              <ButtonLink class="mt-4" href={assetSamplePreviewHref()}>
                First page
              </ButtonLink>
            </div>
          }
        >
          <DevelopmentAssetCatalogue
            after={after()}
            pageHref={assetSamplePreviewHref}
          />
        </Show>
      </section>
    </Show>
  );
}
