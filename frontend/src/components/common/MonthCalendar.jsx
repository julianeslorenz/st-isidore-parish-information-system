import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EVENT_KINDS } from '../../data/events.js';
import { PROTOTYPE_TODAY } from '../../utils/constants.js';
import { pillTime } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';
import Button from '../ui/Button.jsx';
import IconButton from '../ui/IconButton.jsx';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// October 2026 starts on a Thursday, so the 35-cell grid begins with day -3 (Sept 28).
const LEADING_DAYS = 3;

export const groupByDay = (items) => items.reduce((map, item) => {
  (map[item.day] ||= []).push(item);
  return map;
}, {});

/**
 * October 2026 month grid. Desktop shows event pills; phones show colour dots and the page lists
 * the day's items underneath (prototype behaviour). Items need { day, kind, time, title }.
 */
export function MonthGrid({ itemsByDay, selectedDay, onSelectDay }) {
  return (
    <div role="grid" aria-label="October 2026" className="grid grid-cols-7">
      {WEEKDAYS.map((d) => (
        <div key={d} role="columnheader" className="border-b border-line bg-paper-2 p-2 text-[12.5px] font-medium text-ink-3 max-sm:px-0 max-sm:py-1.5 max-sm:text-[11.5px]">{d}</div>
      ))}
      {Array.from({ length: 35 }, (_, i) => {
        const day = i - LEADING_DAYS;
        const off = day < 1;
        const label = off ? 30 + day : day;
        const items = off ? [] : itemsByDay[day] ?? [];
        const isToday = day === PROTOTYPE_TODAY.day;
        const cellClass = 'relative block min-h-[104px] min-w-0 border-b border-r border-line p-1.5 text-left [&:nth-child(7n)]:border-r-0 max-md:min-h-[52px] max-md:p-1 max-md:text-center';
        const number = (
          <span className={cn('inline-flex h-6 w-6 items-center justify-center rounded-full text-[12.5px] font-medium max-md:h-[26px] max-md:w-[26px]', isToday && 'bg-wine text-white', off && 'text-[#BDB5AC]')}>{label}</span>
        );
        if (off) return <div key={i} role="gridcell" aria-disabled="true" className={cn(cellClass, 'bg-paper-2')}>{number}</div>;
        return (
          <button
            key={i}
            type="button"
            role="gridcell"
            aria-pressed={selectedDay === day}
            aria-label={`October ${day}${isToday ? ' (today)' : ''}, ${items.length} ${items.length === 1 ? 'item' : 'items'}`}
            onClick={() => onSelectDay(day)}
            className={cn(cellClass, 'hover:bg-paper-3', selectedDay === day && 'shadow-[inset_0_0_0_2px_#B8892F]')}
          >
            {number}
            {items.slice(0, 2).map((e, k) => {
              const color = EVENT_KINDS[e.kind].color;
              return (
                <span key={k} className="mt-[3px] block overflow-hidden text-ellipsis whitespace-nowrap rounded-[5px] border-l-[3px] px-1.5 py-0.5 text-xs font-medium leading-[1.3] max-md:hidden" style={{ borderColor: color, color, background: `${color}14` }}>
                  {pillTime(e.time)} {e.title}
                </span>
              );
            })}
            {items.length > 2 && <span className="px-1.5 py-0.5 text-xs text-ink-3 max-md:hidden">+{items.length - 2} more</span>}
            <span className="mt-0.5 hidden justify-center gap-[3px] max-md:flex">
              {items.slice(0, 3).map((e, k) => <i key={k} className="h-1.5 w-1.5 rounded-full" style={{ background: EVENT_KINDS[e.kind].color }} />)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Toolbar + grid in a bordered wrapper. `actions` appears on the right of the title row. */
export default function MonthCalendar({ itemsByDay, selectedDay, onSelectDay, onToday, actions }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3.5">
        <IconButton variant="secondary" size="sm" label="Previous month" disabled title="Sample data covers October 2026 only"><ChevronLeft size={16} /></IconButton>
        <IconButton variant="secondary" size="sm" label="Next month" disabled title="Sample data covers October 2026 only"><ChevronRight size={16} /></IconButton>
        <Button variant="secondary" size="sm" onClick={onToday}>Today</Button>
        <h3 className="mx-2">October 2026</h3>
        <span className="flex-1" />
        {actions}
      </div>
      <MonthGrid itemsByDay={itemsByDay} selectedDay={selectedDay} onSelectDay={onSelectDay} />
    </div>
  );
}
