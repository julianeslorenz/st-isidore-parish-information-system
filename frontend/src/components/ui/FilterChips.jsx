import { cn } from '../../utils/cn.js';

/** Status filter pills with counts (prototype .fchip). */
export default function FilterChips({ options, value, onChange, className }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="group" aria-label="Filter by status">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cn('rounded-full border px-3 py-[5px] text-[13px] font-medium', on ? 'border-wine bg-wine text-white' : 'border-line-2 bg-white text-ink-2 hover:bg-paper')}
          >
            {o.label}
            {o.count !== undefined && <b className={cn('ml-1 font-semibold', on ? 'text-wine-2' : 'text-ink-3')}>{o.count}</b>}
          </button>
        );
      })}
    </div>
  );
}

/** Larger pill row used on the public events page (prototype .chipr). */
export function CategoryChips({ options, value, onChange }) {
  return (
    <div className="mb-[18px] flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={cn('h-[34px] rounded-full border px-3.5 font-medium', value === o ? 'border-wine bg-wine text-white' : 'border-line-2 bg-white')}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
