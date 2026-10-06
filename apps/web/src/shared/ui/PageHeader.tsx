import type { JSX } from 'solid-js';

/** Consistent route heading. Each route renders one page header. */
export function PageHeader(props: {
  readonly eyebrow: string;
  readonly title: string;
  readonly children: JSX.Element;
}) {
  return (
    <header>
      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        {props.eyebrow}
      </p>
      <h1 id="page-title" class="mt-2 text-3xl font-semibold tracking-tight">
        {props.title}
      </h1>
      <p class="mt-3 max-w-2xl text-base leading-7 text-muted">
        {props.children}
      </p>
    </header>
  );
}
