import { cn } from '../../utils/cn.js';

/** Definition list in two columns that collapses to one on phones (prototype .kv). */
export default function KeyValue({ items, labelWidth = 150, className }) {
  return (
    <dl className={cn('m-0 grid grid-cols-[var(--kv)_1fr] gap-x-4 gap-y-2.5 max-sm:grid-cols-1 max-sm:gap-y-0.5', className)} style={{ '--kv': `${labelWidth}px` }}>
      {items.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-[13px] text-ink-3 max-sm:mt-2">{label}</dt>
          <dd className="m-0 font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
