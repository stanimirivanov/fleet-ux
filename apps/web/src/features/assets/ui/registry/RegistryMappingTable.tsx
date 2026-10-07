import { For, Show } from 'solid-js';
import type { RegistryReviewSnapshot } from '../../model/registry-review';
import { SamplePanel } from '../overview/SamplePanel';
import { RegistryMappingCards } from './RegistryMappingCards';
import { RegistryMappingRow } from './RegistryMappingRow';

/** Wide table and narrow cards expose the same source-to-target evidence. */
export function RegistryMappingTable(props: {
  readonly snapshot: RegistryReviewSnapshot | null;
  readonly selectedSourceKey: string | null;
  readonly onSelectSource: (key: string) => void;
}) {
  return (
    <SamplePanel
      title="Signal mapping"
      description="Effective source bindings known at the selected review time"
    >
      <Show
        when={props.snapshot}
        fallback={
          <p role="status" class="p-5 text-xs text-muted">
            No sample structure or signal mapping is modeled for this identity.
          </p>
        }
      >
        {(snapshot) => (
          <Show
            when={snapshot().sourceReviews.length > 0}
            fallback={
              <p role="status" class="p-5 text-xs text-muted">
                No source inventory or effective binding appears in this modeled
                sample scene.
              </p>
            }
          >
            <RegistryMappingCards
              snapshot={snapshot()}
              selectedSourceKey={props.selectedSourceKey}
              onSelectSource={props.onSelectSource}
            />
            <div class="hidden min-w-0 overflow-x-auto lg:block">
              <table class="w-full min-w-[39rem] border-collapse text-left text-xs">
                <caption class="sr-only">
                  Source signals and their effective mapping
                </caption>
                <thead class="bg-canvas text-[10px] font-semibold uppercase tracking-wide text-muted">
                  <tr>
                    <th scope="col" class="px-3 py-2">
                      Signal
                    </th>
                    <th scope="col" class="px-3 py-2">
                      Source
                    </th>
                    <th scope="col" class="px-3 py-2">
                      State
                    </th>
                    <th scope="col" class="px-3 py-2">
                      Target property
                    </th>
                    <th scope="col" class="px-3 py-2">
                      Binding
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <For each={snapshot().sourceReviews}>
                    {(review) => (
                      <RegistryMappingRow
                        review={review}
                        nodes={snapshot().nodes}
                        selected={review.key === props.selectedSourceKey}
                        onSelect={props.onSelectSource}
                      />
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        )}
      </Show>
    </SamplePanel>
  );
}
