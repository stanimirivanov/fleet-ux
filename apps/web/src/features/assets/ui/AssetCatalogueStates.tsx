import type { AssetCatalogueLoadFailure } from '../model/asset-catalogue';
import type { AssetCatalogueCopy } from './asset-catalogue-copy';

export function CatalogueLoading(props: { readonly copy: AssetCatalogueCopy }) {
  return (
    <p role="status" class="text-sm text-muted">
      {props.copy.loading}
    </p>
  );
}

export function CatalogueError(props: {
  readonly copy: AssetCatalogueCopy;
  readonly failure: AssetCatalogueLoadFailure;
  readonly onRetry: () => void;
}) {
  const explanation = () => {
    switch (props.failure.kind) {
      case 'invalid-request':
        return props.copy.invalidRequest;
      case 'invalid-response':
        return props.copy.invalidResponse;
      case 'unavailable':
        return props.copy.unavailable;
    }
  };

  return (
    <div role="alert" class="rounded-lg border border-outline p-5">
      <h3 class="text-base font-semibold">{props.copy.errorTitle}</h3>
      <p class="mt-2 text-sm leading-6 text-muted">{explanation()}</p>
      <button
        type="button"
        class="mt-4 inline-flex min-h-11 items-center rounded-lg border border-outline px-4 text-sm font-semibold text-accent hover:bg-canvas"
        onClick={props.onRetry}
      >
        Retry loading
      </button>
    </div>
  );
}

export function CatalogueEmpty(props: {
  readonly after?: string;
  readonly copy: AssetCatalogueCopy;
}) {
  return (
    <p role="status" class="text-sm leading-7 text-muted">
      {props.after === undefined
        ? props.copy.firstEmpty
        : props.copy.laterEmpty}
    </p>
  );
}
