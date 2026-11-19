import { cn } from '../../utils/cn.js';
import { STATUS_LABELS } from '../../data/statuses.js';

// Visual meaning of each status (colour pairs come from the prototype's .b-* classes).
const STATUS_STYLES = {
  pending: 'bg-warn-bg text-warn',
  approved: 'bg-ok-bg text-ok',
  confirmed: 'bg-ok-bg text-ok',
  issued: 'bg-ok-bg text-ok',
  active: 'bg-ok-bg text-ok',
  ready: 'bg-ok-bg text-ok',
  rejected: 'bg-bad-bg text-bad',
  revoked: 'bg-bad-bg text-bad',
  completed: 'bg-info-bg text-info',
  released: 'bg-info-bg text-info',
  processing: 'bg-info-bg text-info',
  rescheduled: 'bg-vio-bg text-vio',
  draft: 'bg-mute-bg text-mute',
  inactive: 'bg-mute-bg text-mute',
  cancelled: 'bg-mute-bg text-mute',
};

const pill =
  'inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12.5px] font-medium before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-[""]';

export function Badge({ className, children }) {
  return <span className={cn(pill, className)}>{children}</span>;
}

/** Status pill. `label` overrides the default wording (used by the parishioner certificate view). */
export function StatusBadge({ status, label, className }) {
  return <Badge className={cn(STATUS_STYLES[status] ?? STATUS_STYLES.draft, className)}>{label ?? STATUS_LABELS[status] ?? status}</Badge>;
}

/** Small neutral label (prototype .tag). Pass `color` for a coloured category tag. */
export function Tag({ color, className, children }) {
  return (
    <span
      className={cn('inline-block rounded-md bg-mute-bg px-2 py-px text-xs text-ink-2', className)}
      style={color ? { backgroundColor: `${color}1A`, color } : undefined}
    >
      {children}
    </span>
  );
}
