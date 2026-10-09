import { useLocation } from '@solidjs/router';
import { onCleanup, type ParentProps, Show } from 'solid-js';
import { createMetadataReader, MetadataReaderProvider } from '#features/assets';
import {
  createOperatorSessionService,
  OperatorAccessBoundary,
  OperatorSessionProvider,
  useOperatorSession,
} from '#features/identity';
import { createBrowserApi } from '#shared/api';
import { AppShell } from './AppShell';
import { APP_ROUTES, routeTitle } from './route-metadata';
import { isDevelopmentSampleRoute } from './sample-route';

/** One managed HTTP lifetime serves session and metadata ports for the app mount. */
export function BrowserWorkspace(props: ParentProps) {
  const browser = createBrowserApi();
  const reader = createMetadataReader(browser);
  const session = createOperatorSessionService(browser);
  onCleanup(() => {
    void browser.dispose();
  });
  return (
    <OperatorSessionProvider service={session}>
      <MetadataComposition reader={reader}>
        {props.children}
      </MetadataComposition>
    </OperatorSessionProvider>
  );
}

function MetadataComposition(
  props: ParentProps<{
    readonly reader: ReturnType<typeof createMetadataReader>;
  }>,
) {
  const operator = useOperatorSession();
  return (
    <MetadataReaderProvider
      reader={props.reader}
      onUnauthorized={operator.invalidate}
    >
      <AppShell>{props.children}</AppShell>
    </MetadataReaderProvider>
  );
}

/** Sample previews never become an authentication fallback. */
export function MetadataAccessBoundary(props: ParentProps) {
  const location = useLocation();
  const operator = useOperatorSession();
  const preview = () =>
    isDevelopmentSampleRoute(
      location.pathname,
      location.search,
      import.meta.env.DEV,
    );
  return (
    <Show
      when={preview()}
      fallback={
        <div class="grid min-w-0 gap-5">
          <Show when={operator.state().kind !== 'authenticated'}>
            <header>
              <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                Workspace / Metadata
              </p>
              <h1
                id="page-title"
                class="mt-1 text-2xl font-semibold tracking-tight sm:text-[1.7rem]"
              >
                {location.pathname === APP_ROUTES.registry.path
                  ? 'Asset registry & signal mapping'
                  : routeTitle(location.pathname)}
              </h1>
              <p class="mt-1 text-sm text-muted">
                Operator access is required to review authorized tenant
                metadata.
              </p>
            </header>
          </Show>
          <OperatorAccessBoundary>{props.children}</OperatorAccessBoundary>
        </div>
      }
    >
      {props.children}
    </Show>
  );
}
