import { A } from '@solidjs/router';
import { For } from 'solid-js';
import { PRIMARY_NAVIGATION } from '../route-metadata';

/** Product-level destinations; feature pages own their local navigation. */
export function PrimaryNav() {
  return (
    <aside class="min-w-0 border-b border-outline bg-surface md:border-r md:border-b-0">
      <nav
        aria-label="Primary navigation"
        class="flex gap-1 overflow-x-auto p-3 md:sticky md:top-16 md:flex-col md:gap-1 md:p-4"
      >
        <For each={PRIMARY_NAVIGATION}>
          {(group, index) => (
            <>
              <span
                class="hidden px-3 pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted md:block"
                classList={{ 'pt-2': index() === 0, 'pt-6': index() > 0 }}
              >
                {group.heading}
              </span>
              <For each={group.routes}>
                {(route) => (
                  <A
                    href={route.path}
                    end
                    class="fi-nav-link"
                    activeClass="fi-nav-link--active"
                  >
                    {route.navigationLabel}
                  </A>
                )}
              </For>
            </>
          )}
        </For>
      </nav>
    </aside>
  );
}
