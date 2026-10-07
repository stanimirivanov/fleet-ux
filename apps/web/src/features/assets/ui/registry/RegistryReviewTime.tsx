import { createEffect, createSignal } from 'solid-js';
import { SamplePanel } from '../overview/SamplePanel';

function utcInputValue(milliseconds: number): string {
  const date = new Date(milliseconds);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 19);
}

function parseUtcInput(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/u.test(value)) return null;
  const normalized = value.length === 16 ? `${value}:00` : value;
  const milliseconds = Date.parse(`${normalized}Z`);
  if (!Number.isFinite(milliseconds)) return null;
  return utcInputValue(milliseconds) === normalized ? milliseconds : null;
}

/** Draft both temporal dimensions before committing one coherent review URL. */
export function RegistryReviewTime(props: {
  readonly effectiveAtMs: number;
  readonly knownAtMs: number;
  readonly onApply: (effectiveAtMs: number, knownAtMs: number) => void;
}) {
  const [effectiveDraft, setEffectiveDraft] = createSignal('');
  const [knownDraft, setKnownDraft] = createSignal('');
  const [error, setError] = createSignal('');

  // Browser Back changes applied cutoffs; reset only when those props change,
  // leaving an in-progress draft untouched by unrelated parent updates.
  createEffect(() => {
    setEffectiveDraft(utcInputValue(props.effectiveAtMs));
    setKnownDraft(utcInputValue(props.knownAtMs));
    setError('');
  });

  const apply = (event: SubmitEvent) => {
    event.preventDefault();
    const effectiveAtMs = parseUtcInput(effectiveDraft());
    const knownAtMs = parseUtcInput(knownDraft());
    if (effectiveAtMs === null || knownAtMs === null) {
      setError('Enter valid UTC dates and times before applying the review.');
      return;
    }
    setError('');
    props.onApply(effectiveAtMs, knownAtMs);
  };

  return (
    <SamplePanel
      title="Review time"
      description="Effective physical configuration and knowledge recorded by FleetIQ are separate."
    >
      <form
        onSubmit={apply}
        class="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
      >
        <label class="grid min-w-0 gap-1 text-xs font-medium text-muted">
          Effective at (UTC)
          <input
            aria-label="Effective at (UTC)"
            type="datetime-local"
            step="1"
            required
            value={effectiveDraft()}
            onInput={(event) => setEffectiveDraft(event.currentTarget.value)}
            class="h-10 min-w-0 rounded-md border border-outline bg-surface px-3 text-sm text-foreground"
          />
        </label>
        <label class="grid min-w-0 gap-1 text-xs font-medium text-muted">
          Known at (UTC)
          <input
            aria-label="Known at (UTC)"
            type="datetime-local"
            step="1"
            required
            value={knownDraft()}
            onInput={(event) => setKnownDraft(event.currentTarget.value)}
            class="h-10 min-w-0 rounded-md border border-outline bg-surface px-3 text-sm text-foreground"
          />
        </label>
        <button
          type="submit"
          class="min-h-10 rounded-md bg-accent px-4 text-xs font-semibold text-on-accent hover:opacity-90"
        >
          Apply review times
        </button>
        {error() && (
          <p role="alert" class="text-xs text-status-critical sm:col-span-3">
            {error()}
          </p>
        )}
      </form>
    </SamplePanel>
  );
}
