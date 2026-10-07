import { Show } from 'solid-js';
import { ButtonLink } from '#shared/ui';
import type { AssetPage } from '../model/asset-catalogue';
import type { AssetCatalogueCopy } from './asset-catalogue-copy';

export function AssetCataloguePagination(props: {
  readonly page: AssetPage;
  readonly after?: string;
  readonly pageHref?: (after?: string) => string;
  readonly copy: AssetCatalogueCopy;
}) {
  const firstHref = () =>
    props.after === undefined ? undefined : props.pageHref?.();
  const nextHref = () =>
    props.page.nextAfter === null
      ? undefined
      : props.pageHref?.(props.page.nextAfter);

  return (
    <>
      <Show when={props.page.nextAfter !== null && !props.pageHref}>
        <p class="mt-4 text-sm leading-6 text-muted">
          {props.copy.moreWithoutNavigation}
        </p>
      </Show>
      <Show when={firstHref() || nextHref()}>
        <nav
          aria-label="Asset catalogue pages"
          class="mt-5 flex flex-wrap gap-3 border-t border-outline pt-5"
        >
          <Show when={firstHref()}>
            {(href) => <ButtonLink href={href()}>First page</ButtonLink>}
          </Show>
          <Show when={nextHref()}>
            {(href) => <ButtonLink href={href()}>Next page</ButtonLink>}
          </Show>
        </nav>
      </Show>
    </>
  );
}
