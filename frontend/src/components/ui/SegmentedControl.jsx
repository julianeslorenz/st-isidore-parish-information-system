import { cn } from '../../utils/cn.js';

export default function SegmentedControl({ options, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="inline-flex gap-0.5 rounded-[10px] bg-[#F3EEE6] p-[3px]">
      {options.map((o) => {
        const { value: v, label: text } = typeof o === 'string' ? { value: o, label: o } : o;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={value === v}
            onClick={() => onChange(v)}
            className={cn('rounded-lg border-0 px-3 py-1.5 text-[13px] font-medium', value === v ? 'bg-white text-wine shadow-[0_1px_2px_rgba(0,0,0,.12)]' : 'bg-transparent text-ink-2')}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}
