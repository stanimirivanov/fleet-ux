import { A, useLocation } from '@solidjs/router';
import { For } from 'solid-js';
import {
  isAssetInspectorSamplePreview,
  isAssetSamplePreview,
  isMapSamplePreview,
} from '#features/assets';
import { APP_ROUTES, PRIMARY_NAVIGATION } from '../route-metadata';

const ICON_PATHS = {
  overview: 'M3 3h8v8H3z M13 3h8v5h-8z M13 10h8v11h-8z M3 13h8v8H3z',
  map: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15 M15 6v15',
  assets: 'M4 5h16v14H4z M4 9h16 M8 13h4 M8 16h7',
  alerts: 'M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6z M10 20h4',
  insights: 'M3 20h18 M5 16l4-5 4 3 6-8 M17 6h2v2',
  admin:
    'M12 3l2 2 3-.5.5 3L20 9l-1 3 1 3-2.5 1.5-.5 3-3-.5-2 2-2-2-3 .5-.5-3L4 15l1-3-1-3 2.5-1.5.5-3L10 5z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  design: 'M5 4h14v16H5z M5 9h14 M9 9v11 M12 13h4',
} as const;

function NavIcon(props: { name: keyof typeof ICON_PATHS }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="size-4 shrink-0"
    >
      <path d={ICON_PATHS[props.name]} />
    </svg>
  );
}

/** Product-level destinations; unavailable areas remain visibly non-interactive. */
export function PrimaryNav() {
  const location = useLocation();
  const isSampleWorkspace = () =>
    import.meta.env.DEV &&
    (location.pathname === APP_ROUTES.overview.path ||
      isMapSamplePreview(location.pathname, location.search) ||
      isAssetInspectorSamplePreview(location.pathname, location.search) ||
      isAssetSamplePreview(location.pathname, location.search));

  return (
    <aside class="fi-sidebar min-w-0 border-b border-outline bg-surface md:border-r md:border-b-0">
      <nav
        aria-label="Primary navigation"
        class="fi-primary-nav flex gap-1 overflow-x-auto px-3 py-2 md:flex-col md:overflow-visible md:px-3 md:py-5"
      >
        <For each={PRIMARY_NAVIGATION}>
          {(group) => (
            <>
              <span class="fi-nav-heading hidden px-3 text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-muted md:block">
                {group.heading}
              </span>
              <For each={group.items}>
                {(item) =>
                  item.kind === 'route' ? (
                    <A
                      href={
                        item.route.path === APP_ROUTES.assets.path &&
                        import.meta.env.DEV
                          ? '/assets?preview=sample'
                          : item.route.path === APP_ROUTES.map.path &&
                              import.meta.env.DEV
                            ? '/map?preview=sample'
                            : item.route.path
                      }
                      end={item.route.path !== APP_ROUTES.assets.path}
                      class="fi-nav-link"
                      activeClass="fi-nav-link--active"
                    >
                      <NavIcon name={item.icon} />
                      {item.route.navigationLabel}
                    </A>
                  ) : (
                    <span
                      class="fi-nav-link fi-nav-link--planned"
                      title={`${item.label} is planned`}
                    >
                      <NavIcon name={item.icon} />
                      {item.label}
                      <span class="sr-only"> (planned)</span>
                    </span>
                  )
                }
              </For>
            </>
          )}
        </For>
      </nav>
      {isSampleWorkspace() && (
        <div class="fi-sidebar-footnote hidden border-t border-outline px-5 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted md:flex md:items-center md:gap-2">
          <span aria-hidden="true" class="size-1.5 rounded-full bg-accent" />
          Sample workspace
        </div>
      )}
    </aside>
  );
}
