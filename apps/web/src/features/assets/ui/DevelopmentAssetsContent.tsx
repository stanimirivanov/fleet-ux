import { A, useLocation } from '@solidjs/router';
import { type JSX, Show } from 'solid-js';
import DevelopmentAssetCatalogue from './DevelopmentAssetCatalogue';

/** Explicit URL opt-in; this whole module is excluded from production builds. */
export default function DevelopmentAssetsContent(props: {
  readonly connectionNotice: JSX.Element;
}) {
  const location = useLocation();
  const showingSample = () =>
    new URLSearchParams(location.search).get('preview') === 'sample';

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
        <DevelopmentAssetCatalogue />
      </section>
    </Show>
  );
}
