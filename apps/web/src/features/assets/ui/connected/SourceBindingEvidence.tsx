import { createMemo, Show } from 'solid-js';
import type { SourceSnapshotRequest } from '../../model/metadata';
import { BindingRecords } from './BindingRecords';
import { DefinitionEvidence } from './DefinitionEvidence';
import { MetadataPagination } from './MetadataPagination';
import { MetadataPanel } from './MetadataPanel';
import { MetadataReadContent } from './MetadataReadContent';
import { SourceContextForm } from './SourceContextForm';
import { useMetadataRead } from './useMetadataRead';
import type { MetadataWorkspace } from './useMetadataWorkspace';

/** Exact-source candidates cannot establish that a device exists or is unassigned. */
export function SourceBindingEvidence(props: {
  readonly workspace: MetadataWorkspace;
  readonly path: string;
}) {
  const request = createMemo<SourceSnapshotRequest | null>(() => {
    const query = props.workspace.query();
    return query?.source
      ? {
          tenantId: query.tenantId,
          source: query.source,
          effectiveAtMs: query.effectiveAtMs,
          knownAtMs: query.knownAtMs,
          limit: 50,
          ...(query.sourceAfter ? { after: query.sourceAfter } : {}),
        }
      : null;
  });
  const read = useMetadataRead(request, (reader, query, options) =>
    reader.listSourceBindings(query, options),
  );
  const selected = createMemo(() => {
    const state = read.state();
    return state.kind === 'ready'
      ? state.value.bindings.find(
          (binding) => binding.id === props.workspace.query()?.bindingId,
        )
      : undefined;
  });
  return (
    <MetadataPanel
      title="Source binding candidates"
      description="Review one exact device / endpoint / signal tuple. Candidates are metadata evidence, not a source inventory or an attribution decision."
    >
      <div class="grid gap-4">
        <SourceContextForm workspace={props.workspace} />
        <MetadataReadContent
          state={read.state()}
          label="source binding candidates"
          retry={read.retry}
        >
          {(page) => (
            <>
              <Show
                when={page.bindings.length > 0}
                fallback={
                  <p role="status" class="text-xs text-muted">
                    No candidates appear in this bounded source snapshot page.
                    This does not mean the source is unassigned or unregistered.
                  </p>
                }
              >
                <BindingRecords
                  bindings={page.bindings}
                  workspace={props.workspace}
                  sourceCandidates
                />
              </Show>
              <MetadataPagination
                workspace={props.workspace}
                path={props.path}
                cursorKey="source_after"
                after={props.workspace.query()?.sourceAfter}
                nextAfter={page.nextAfter}
              />
            </>
          )}
        </MetadataReadContent>
        <Show when={selected()}>
          {(binding) => (
            <div class="rounded-lg border border-outline p-3">
              <h3 class="mb-3 text-xs font-semibold">Pinned property</h3>
              <DefinitionEvidence
                tenantId={props.workspace.query()?.tenantId ?? ''}
                reference={binding().target.property}
                kind="property"
              />
            </div>
          )}
        </Show>
      </div>
    </MetadataPanel>
  );
}
