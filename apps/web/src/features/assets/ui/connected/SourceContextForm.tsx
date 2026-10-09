import { metadataButtonClass, metadataInputClass } from './MetadataPanel';
import type { MetadataWorkspace } from './useMetadataWorkspace';

/** An exact source tuple is a shareable URL context, not a discovered inventory item. */
export function SourceContextForm(props: {
  readonly workspace: MetadataWorkspace;
}) {
  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    props.workspace.update({
      device_asset_id: String(data.get('device_asset_id') ?? ''),
      endpoint_id: String(data.get('endpoint_id') ?? ''),
      signal_id: String(data.get('signal_id') ?? ''),
      source_after: null,
      binding: null,
    });
  };
  return (
    <form onSubmit={submit} class="grid gap-2">
      <label class="grid gap-1 text-xs font-medium">
        Source device asset ID
        <input
          class={metadataInputClass}
          name="device_asset_id"
          value={props.workspace.value('device_asset_id')}
          required
        />
      </label>
      <label class="grid gap-1 text-xs font-medium">
        Source endpoint ID
        <input
          class={metadataInputClass}
          name="endpoint_id"
          value={props.workspace.value('endpoint_id')}
          required
        />
      </label>
      <label class="grid gap-1 text-xs font-medium">
        Source signal ID
        <input
          class={metadataInputClass}
          name="signal_id"
          value={props.workspace.value('signal_id')}
          required
        />
      </label>
      <button type="submit" class={metadataButtonClass}>
        Review exact source
      </button>
    </form>
  );
}
