import { A, useLocation } from '@solidjs/router';
import { type JSX, Show } from 'solid-js';
import { isValidAssetIdentifier } from '../model/asset-catalogue';
import DevelopmentAssetCatalogue from './DevelopmentAssetCatalogue';

/** Explicit URL opt-in; this whole module is excluded from production builds. */
export default function DevelopmentAssetsContent(props: {
  readonly connectionNotice: JSX.Element;
}) {
  const location = useLocation();
  const showingSample = () =>
    new URLSearchParams(location.search).get('preview') === 'sample';
  const cursorValues = () =>
    new URLSearchParams(location.search).getAll('after');
  const validCursor = () => {
    const values = cursorValues();
    return (
      values.length <= 1 &&
      (values.length === 0 || isValidAssetIdentifier(values[0] ?? ''))
    );
  };
  const after = () => cursorValues()[0];

  function previewHref(cursor?: string): string {
    const params = new URLSearchParams({ preview: 'sample' });
    if (cursor !== undefined) params.set('after', cursor);
    return `/assets?${params.toString()}`;
  }

  return (
    <Show
      when={showingSample()}
      fallback={
        <>
          {props.connectionNotice}
          <A
            href="/assets?preview=sample"
            class="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            View sample catalogue
          </A>
        </>
      }
    >
      <section
        aria-labelledby="sample-catalogue-heading"
        class="mt-8 rounded-panel border border-outline bg-surface p-6 sm:p-8"
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
          <A
            href="/assets"
            class="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            Exit sample
          </A>
        </div>
        <Show
          when={validCursor()}
          fallback={
            <div role="alert" class="mt-6 rounded-lg border border-outline p-5">
              <h3 class="text-base font-semibold">Invalid sample cursor</h3>
              <p class="mt-2 text-sm leading-6 text-muted">
                This address cannot select a catalogue page.
              </p>
              <A
                href={previewHref()}
                class="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                First page
              </A>
            </div>
          }
        >
          <DevelopmentAssetCatalogue after={after()} pageHref={previewHref} />
        </Show>
      </section>
    </Show>
  );
}
