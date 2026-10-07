import { useLocation } from '@solidjs/router';
import { lazy, Show, Suspense } from 'solid-js';
import { ConnectionNotice, TextLink } from '#shared/ui';
import { isMapSamplePreview } from '../model/asset-preview-url';

const DevelopmentMapContent = import.meta.env.DEV
  ? lazy(() => import('./DevelopmentMapContent'))
  : undefined;
const SampleContent = DevelopmentMapContent ?? (() => null);

/** Route boundary for location work; sample data is dev-only and opt-in. */
export function FleetMapPage() {
  const location = useLocation();
  const showingSample = () =>
    Boolean(DevelopmentMapContent) &&
    isMapSamplePreview(location.pathname, location.search);

  return (
    <div class="grid min-w-0 gap-4">
      <header class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
            Workspace / Map
          </p>
          <h1
            id="page-title"
            class="mt-1 text-2xl font-semibold tracking-tight sm:text-[1.7rem]"
          >
            Fleet map
          </h1>
          <p class="mt-1 text-sm text-muted">
            Find an asset, inspect location evidence, and keep the list and map
            in sync.
          </p>
        </div>
      </header>
      <Show
        when={showingSample()}
        fallback={
          <div class="grid max-w-3xl gap-4">
            <ConnectionNotice heading="Fleet locations are not connected">
              A browser-safe location read model and map service are not
              configured. A last telemetry event is not a position update, so
              this view cannot infer an asset's location.
            </ConnectionNotice>
            {DevelopmentMapContent && (
              <TextLink href="/map?preview=sample">
                View illustrative map
              </TextLink>
            )}
          </div>
        }
      >
        <Suspense fallback={<p role="status">Opening illustrative map…</p>}>
          <SampleContent />
        </Suspense>
      </Show>
    </div>
  );
}
