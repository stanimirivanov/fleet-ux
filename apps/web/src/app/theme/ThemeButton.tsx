import { type Accessor, Show } from 'solid-js';
import { nextThemePreference, type ThemePreference } from './theme-preference';

type ThemeButtonProps = {
  preference: Accessor<ThemePreference>;
  resolvedTheme: Accessor<'light' | 'dark'>;
  onCycle: () => void;
};

/** A single control for the Light → Dark → System preference cycle. */
export function ThemeButton(props: ThemeButtonProps) {
  const label = () => {
    const current =
      props.preference() === 'system'
        ? `system (${props.resolvedTheme()})`
        : props.preference();
    return `Theme: ${current}. Switch to ${nextThemePreference(props.preference())}.`;
  };

  return (
    <button
      type="button"
      class="grid size-10 shrink-0 place-items-center rounded-lg border border-outline bg-surface text-foreground hover:bg-canvas"
      aria-label={label()}
      title={label()}
      onClick={props.onCycle}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-5"
      >
        <Show when={props.preference() === 'light'}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </Show>
        <Show when={props.preference() === 'dark'}>
          <path d="M20.8 13a9 9 0 0 1-9.8-9.8A9 9 0 1 0 20.8 13Z" />
        </Show>
        <Show when={props.preference() === 'system'}>
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M8 21h8m-4-3v3" />
        </Show>
      </svg>
    </button>
  );
}
