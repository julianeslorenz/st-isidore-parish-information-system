import { cn } from '../../utils/cn.js';

export const Skeleton = ({ className, style }) => <div className={cn('skeleton', className)} style={style} aria-hidden="true" />;
export const Spinner = ({ className }) => <span className={cn('spinner', className)} role="presentation" />;

/** Placeholder card shown while a report or list "loads". */
export function LoadingState({ label = 'Loading', lines = 3 }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label={label}>
      {Array.from({ length: lines }, (_, i) => <Skeleton key={i} style={{ width: `${100 - i * 15}%` }} />)}
    </div>
  );
}
