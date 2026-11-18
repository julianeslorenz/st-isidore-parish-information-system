import { cn } from '../../utils/cn.js';

/** Underlined tab bar (prototype .tabs). The page owns the panel; this renders the tablist. */
export default function Tabs({ tabs, value, onChange, label = 'Sections', className }) {
  return (
    <div role="tablist" aria-label={label} className={cn('mb-[18px] flex gap-1 overflow-x-auto border-b border-line', className)}>
      {tabs.map((tab) => {
        const { value: v, label: text } = typeof tab === 'string' ? { value: tab, label: tab } : tab;
        const selected = v === value;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(v)}
            className={cn(
              '-mb-px whitespace-nowrap border-0 border-b-2 bg-transparent px-3.5 py-2.5 font-medium',
              selected ? 'border-gold text-wine' : 'border-transparent text-ink-2 hover:text-ink',
            )}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}
