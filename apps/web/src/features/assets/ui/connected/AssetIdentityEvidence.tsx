import { For, Show } from 'solid-js';
import type { AssetDetail } from '../../model/metadata';
import { DefinitionEvidence } from './DefinitionEvidence';
import { MetadataPanel } from './MetadataPanel';

/** External identifiers describe identity; they never replace FleetIQ's internal ID. */
export function AssetIdentityEvidence(props: { readonly asset: AssetDetail }) {
  return (
    <div class="grid gap-4">
      <MetadataPanel title="Asset identity">
        <dl class="grid gap-3 text-xs">
          <div>
            <dt class="text-muted">Internal asset ID</dt>
            <dd class="mt-1 break-all font-mono">{props.asset.id}</dd>
          </div>
          <div>
            <dt class="text-muted">Tenant</dt>
            <dd class="mt-1 break-all font-mono">{props.asset.tenantId}</dd>
          </div>
          <div>
            <dt class="text-muted">Display name</dt>
            <dd class="mt-1">{props.asset.name}</dd>
          </div>
        </dl>
        <h3 class="mt-4 text-xs font-semibold">External identifiers</h3>
        <Show
          when={props.asset.externalIdentifiers.length > 0}
          fallback={
            <p class="mt-2 text-xs text-muted">
              No external identifiers are registered for this asset.
            </p>
          }
        >
          <ul aria-label="External identifiers" class="mt-2 grid gap-2">
            <For each={props.asset.externalIdentifiers}>
              {(identifier) => (
                <li class="rounded-md border border-outline p-2 text-xs">
                  <p class="font-semibold">
                    {identifier.kind} ·{' '}
                    {identifier.authority ?? 'No authority specified'}
                  </p>
                  <p class="mt-1 break-all font-mono text-muted">
                    {identifier.value}
                  </p>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </MetadataPanel>
      <MetadataPanel
        title="Pinned asset type"
        description="The asset references this exact definition version; definitions are not inferred from telemetry."
      >
        <DefinitionEvidence
          tenantId={props.asset.tenantId}
          reference={props.asset.assetType}
          kind="asset-type"
        />
      </MetadataPanel>
    </div>
  );
}
