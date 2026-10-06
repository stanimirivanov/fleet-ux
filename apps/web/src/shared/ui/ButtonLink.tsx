import { A } from '@solidjs/router';
import type { JSX } from 'solid-js';

/** Outlined navigation action; the caller owns positioning. */
export function ButtonLink(props: {
  readonly href: string;
  readonly children: JSX.Element;
  readonly class?: string;
}) {
  return (
    <A
      href={props.href}
      class={`inline-flex min-h-11 items-center rounded-lg border border-outline px-4 text-sm font-semibold text-accent hover:bg-canvas ${props.class ?? ''}`}
    >
      {props.children}
    </A>
  );
}
