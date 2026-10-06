import { useLocation } from '@solidjs/router';
import type { ParentProps } from 'solid-js';
import { routeTitle } from './route-metadata';
import { AppHeader } from './shell/AppHeader';
import { PrimaryNav } from './shell/PrimaryNav';
import { useDocumentTitle, useRouteFocus } from './shell/use-route-lifecycle';

/** Router root layout: the frame remains mounted as route content changes. */
export function AppShell(props: ParentProps) {
  const location = useLocation();
  let mainElement: HTMLElement | undefined;
  useDocumentTitle();
  useRouteFocus(() => mainElement);

  return (
    <>
      <a href="#main-content" class="fi-skip-link">
        Skip to main content
      </a>
      <div class="min-h-screen bg-canvas text-foreground">
        <AppHeader />
        <div class="grid min-h-[calc(100vh-4rem)] md:grid-cols-[15rem_minmax(0,1fr)]">
          <PrimaryNav />
          <main
            ref={mainElement}
            id="main-content"
            tabindex="-1"
            aria-label={routeTitle(location.pathname)}
            class="min-w-0 px-5 py-8 sm:px-8 lg:px-10"
          >
            {props.children}
          </main>
        </div>
      </div>
    </>
  );
}
