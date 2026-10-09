import { createMemo, Show } from 'solid-js';
import type { AssetSnapshotRequest } from '../../model/metadata';
import { MetadataPagination } from './MetadataPagination';
import { MetadataPanel } from './MetadataPanel';
import { MetadataReadContent } from './MetadataReadContent';
import { RelationshipRecords } from './RelationshipRecords';
import { useMetadataRead } from './useMetadataRead';
import type { MetadataWorkspace } from './useMetadataWorkspace';

/** Directed incident relationships are a bounded snapshot, never a complete tree. */
export function RelationshipEvidence(props: {
  readonly workspace: MetadataWorkspace;
  readonly assetId?: string;
  readonly path: string;
}) {
  const request = createMemo<AssetSnapshotRequest | null>(() => {
    const query = props.workspace.query();
    return query && props.assetId
      ? {
          tenantId: query.tenantId,
          assetId: props.assetId,
          effectiveAtMs: query.effectiveAtMs,
          knownAtMs: query.knownAtMs,
          limit: 50,
          ...(query.relationshipAfter
            ? { after: query.relationshipAfter }
            : {}),
        }
      : null;
  });
  const read = useMetadataRead(request, (reader, query, options) =>
    reader.listRelationships(query, options),
  );
  return (
    <MetadataPanel
      title="Directed relationships"
      description="Relationships incident to this asset at the chosen effective and known times. A page is not a complete topology."
    >
      <MetadataReadContent
        state={read.state()}
        label="relationships"
        retry={read.retry}
      >
        {(page) => (
          <>
            <Show
              when={page.relationships.length > 0}
              fallback={
                <p role="status" class="text-xs text-muted">
                  No relationships appear in this bounded snapshot page.
                </p>
              }
            >
              <RelationshipRecords
                relationships={page.relationships}
                tenantId={props.workspace.query()?.tenantId ?? ''}
                workspace={props.workspace}
              />
            </Show>
            <MetadataPagination
              workspace={props.workspace}
              path={props.path}
              cursorKey="relationship_after"
              after={props.workspace.query()?.relationshipAfter}
              nextAfter={page.nextAfter}
            />
          </>
        )}
      </MetadataReadContent>
    </MetadataPanel>
  );
}
