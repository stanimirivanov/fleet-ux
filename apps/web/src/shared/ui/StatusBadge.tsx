export type StatusTone = 'nominal' | 'warning' | 'critical' | 'unknown';

type StatusBadgeProps = {
  label: string;
  tone: StatusTone;
};

/**
 * Adds a readable label to a semantic status tone. The tone must never be the
 * only way a status is communicated to an operator.
 */
export function StatusBadge(props: StatusBadgeProps) {
  return (
    <span class={`fi-status-badge fi-status-badge--${props.tone}`}>
      <span class="fi-status-badge__mark" aria-hidden="true" />
      {props.label}
    </span>
  );
}
