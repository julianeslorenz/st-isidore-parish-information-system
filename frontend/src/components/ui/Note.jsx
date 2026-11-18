import { cn } from '../../utils/cn.js';

const tones = { gold: 'bg-gold-1 text-ink-2', danger: 'bg-bad-bg text-bad', paper: 'bg-paper text-ink-2' };

/** Soft callout box (prototype .note). */
export default function Note({ tone = 'gold', className, children, ...props }) {
  return <div className={cn('rounded-[10px] px-3.5 py-3 text-[13px]', tones[tone], className)} {...props}>{children}</div>;
}
