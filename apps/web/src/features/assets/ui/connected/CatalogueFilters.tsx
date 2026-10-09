import { For, Show } from 'solid-js';
import { metadataInputClass } from './MetadataPanel';
import type { MetadataWorkspace } from './useMetadataWorkspace';

export function CatalogueFilters(props: {
  readonly workspace: MetadataWorkspace;
  readonly types: readonly string[];
}) {
  return (
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="grid gap-1 text-xs font-medium">
        Filter assets
        <input
          class={metadataInputClass}
          type="search"
          maxlength={200}
          value={props.workspace.query()?.q ?? ''}
          onInput={(event) =>
            props.workspace.update({ q: event.currentTarget.value }, true)
          }
          placeholder="Name or identity on this page"
        />
      </label>
      <label class="grid gap-1 text-xs font-medium">
        Asset type
        <select
          class={metadataInputClass}
          value={props.workspace.query()?.type ?? ''}
          onChange={(event) =>
            props.workspace.update({ type: event.currentTarget.value })
          }
        >
          <option value="">All types on this page</option>
          <Show
            when={
              props.workspace.query()?.type &&
              !props.types.includes(props.workspace.query()?.type ?? '')
            }
          >
            <option value={props.workspace.query()?.type}>
              {props.workspace.query()?.type}
            </option>
          </Show>
          <For each={props.types}>
            {(type) => <option value={type}>{type}</option>}
          </For>
        </select>
      </label>
    </div>
  );
}
