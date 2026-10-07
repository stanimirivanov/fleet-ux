import { useLocation } from '@solidjs/router';
import { lazy, Show, Suspense } from 'solid-js';
import { ConnectionNotice, TextLink } from '#shared/ui';
import {
  isRegistrySamplePreview,
  registrySampleHref,
} from '../model/asset-preview-url';

const DevelopmentRegistryContent = import.meta.env.DEV
  ? lazy(() => import('./DevelopmentRegistryContent'))
  : undefined;
const SampleContent = DevelopmentRegistryContent ?? (() => null);

/** Route boundary for read-only commissioning review; sample data is dev-only. */
export function AssetRegistryPage() {
  const location = useLocation();
  const showingSample = () =>
    Boolean(DevelopmentRegistryContent) &&
    isRegistrySamplePreview(location.pathname, location.search);

  return (
    <div class="grid min-w-0 gap-4">
      <header class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
            Workspace / Assets / Registry
          </p>
          <h1
            id="page-title"
            class="mt-1 text-2xl font-semibold tracking-tight sm:text-[1.7rem]"
          >
            Asset registry & signal mapping
          </h1>
          <p class="mt-1 text-sm text-muted">
            Review asset structure, source attribution, and exact metadata
            revisions.
          </p>
        </div>
      </header>
      <Show
        when={showingSample()}
        fallback={
          <div class="grid max-w-3xl gap-4">
            <ConnectionNotice heading="Asset registry is not connected">
              Protected relationship and binding reads need browser-safe
              identity and a published UI contract. No source inventory or
              mapping state can be inferred from the asset catalogue alone.
            </ConnectionNotice>
            {DevelopmentRegistryContent && (
              <TextLink href={registrySampleHref()}>
                View sample registry
              </TextLink>
            )}
          </div>
        }
      >
        <Suspense fallback={<p role="status">Opening sample registry…</p>}>
          <SampleContent />
        </Suspense>
      </Show>
    </div>
  );
}
