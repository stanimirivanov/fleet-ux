import { createMemo, createSignal, For, Show } from 'solid-js';
import type {
  AssetTypeDefinition,
  DefinitionRef,
  DefinitionRequest,
  PropertyDefinition,
  RelationshipTypeDefinition,
} from '../../model/metadata';
import { MetadataReadContent } from './MetadataReadContent';
import { useMetadataRead } from './useMetadataRead';

type Definition =
  | AssetTypeDefinition
  | PropertyDefinition
  | RelationshipTypeDefinition;

/** Resolves an exact pinned version; expanded references avoid eager unbounded fan-out. */
export function DefinitionEvidence(props: {
  readonly tenantId: string;
  readonly reference: DefinitionRef;
  readonly kind: 'asset-type' | 'property' | 'relationship-type';
  readonly enabled?: boolean;
}) {
  const request = createMemo<DefinitionRequest | null>(() =>
    props.enabled === false
      ? null
      : { tenantId: props.tenantId, ...props.reference },
  );
  const read = useMetadataRead<DefinitionRequest, Definition>(
    request,
    (reader, query, options) => {
      if (props.kind === 'asset-type')
        return reader.getAssetType(query, options);
      if (props.kind === 'property') return reader.getProperty(query, options);
      return reader.getRelationshipType(query, options);
    },
  );
  return (
    <MetadataReadContent
      state={read.state()}
      label={`${props.kind} definition`}
      retry={read.retry}
    >
      {(definition) => (
        <div class="grid gap-2 text-xs">
          <p class="text-sm font-semibold">{definition.name}</p>
          <p class="break-all font-mono text-muted">
            {definition.id} · v{definition.version}
          </p>
          <Show
            when={
              'valueKind' in definition
                ? (definition as PropertyDefinition)
                : undefined
            }
          >
            {(property) => <PropertyDetails definition={property()} />}
          </Show>
          <Show
            when={
              'supportedProperties' in definition
                ? (definition as AssetTypeDefinition)
                : undefined
            }
          >
            {(assetType) => (
              <div class="grid gap-2">
                <p class="font-semibold">Supported properties</p>
                <Show
                  when={assetType().supportedProperties.length > 0}
                  fallback={
                    <p class="text-muted">
                      This type declares no supported properties.
                    </p>
                  }
                >
                  <For each={assetType().supportedProperties}>
                    {(reference) => (
                      <ExpandableDefinition
                        tenantId={props.tenantId}
                        reference={reference}
                        kind="property"
                      />
                    )}
                  </For>
                </Show>
              </div>
            )}
          </Show>
        </div>
      )}
    </MetadataReadContent>
  );
}

function PropertyDetails(props: { readonly definition: PropertyDefinition }) {
  return (
    <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1">
      <dt class="text-muted">Value kind</dt>
      <dd>{props.definition.valueKind}</dd>
      <dt class="text-muted">Canonical unit</dt>
      <dd>{props.definition.canonicalUnit ?? 'No canonical unit declared'}</dd>
    </dl>
  );
}

/** Disclosure state belongs to the reference, rather than the surrounding page. */
export function ExpandableDefinition(props: {
  readonly tenantId: string;
  readonly reference: DefinitionRef;
  readonly kind: 'property' | 'relationship-type';
}) {
  const [expanded, setExpanded] = createSignal(false);
  const label = () =>
    `${props.kind === 'property' ? 'Property' : 'Relationship type'} ${props.reference.id} v${props.reference.version}`;
  return (
    <details
      class="rounded-md border border-outline p-2"
      onToggle={(event) => setExpanded(event.currentTarget.open)}
    >
      <summary class="cursor-pointer break-all text-xs text-accent">
        {label()}
      </summary>
      <Show when={expanded()}>
        <div class="mt-3">
          <DefinitionEvidence
            tenantId={props.tenantId}
            reference={props.reference}
            kind={props.kind}
          />
        </div>
      </Show>
    </details>
  );
}
