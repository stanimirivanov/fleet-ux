import { useSearchParams } from '@solidjs/router';
import { createMemo, Show } from 'solid-js';
import type { DemoInspector } from '../../demo/inspector-fixture';
import { resolveInspectorSelection } from '../../model/inspector-selection';
import { ComponentEvidence, type InspectorTab } from './ComponentEvidence';
import { EvidenceContext } from './EvidenceContext';
import { InspectorHeader } from './InspectorHeader';
import type { HistoryWindow } from './SignalHistory';
import { TopologyTree } from './TopologyTree';

function validTab(value: unknown): InspectorTab {
  return value === 'details' || value === 'events' ? value : 'overview';
}

function validWindow(value: unknown): HistoryWindow {
  return value === '1h' || value === '24h' ? value : '6h';
}

/** URL-backed sample inspector with stable shell and responsive evidence zones. */
export function InspectorWorkspace(props: {
  readonly inspector: DemoInspector;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = createMemo(() =>
    resolveInspectorSelection(
      props.inspector,
      typeof searchParams.component === 'string'
        ? searchParams.component
        : null,
    ),
  );
  const selectedNode = createMemo(() =>
    props.inspector.nodes.find((node) => node.id === selectedId()),
  );
  const tab = () => validTab(searchParams.tab);
  const window = () => validWindow(searchParams.window);

  return (
    <div class="grid min-w-0 gap-4">
      <InspectorHeader inspector={props.inspector} />
      <div class="grid min-w-0 items-start gap-3 xl:grid-cols-[minmax(13rem,0.8fr)_minmax(0,2fr)] 2xl:grid-cols-[minmax(13rem,0.8fr)_minmax(0,1.7fr)_minmax(16rem,0.9fr)]">
        <TopologyTree
          inspector={props.inspector}
          selectedId={selectedId()}
          onSelect={(component) => setSearchParams({ component })}
        />
        <Show when={selectedNode()}>
          {(node) => (
            <>
              <ComponentEvidence
                inspector={props.inspector}
                node={node()}
                tab={tab()}
                onTabChange={(nextTab) =>
                  setSearchParams(
                    { tab: nextTab === 'overview' ? undefined : nextTab },
                    { replace: true },
                  )
                }
                window={window()}
                onWindowChange={(nextWindow) =>
                  setSearchParams(
                    { window: nextWindow === '6h' ? undefined : nextWindow },
                    { replace: true },
                  )
                }
              />
              <div class="min-w-0 xl:col-start-2 2xl:col-start-auto">
                <EvidenceContext inspector={props.inspector} node={node()} />
              </div>
            </>
          )}
        </Show>
      </div>
    </div>
  );
}
