import { A } from '@solidjs/router';
import type { JSX } from 'solid-js';

/** Inline action link with the minimum operator touch target. */
export function TextLink(props: {
  readonly href: string;
  readonly children: JSX.Element;
  readonly class?: string;
}) {
  return (
    <A
      href={props.href}
      class={`inline-flex min-h-11 items-center text-sm font-semibold text-accent underline-offset-4 hover:underline ${props.class ?? ''}`}
    >
      {props.children}
    </A>
  );
}
