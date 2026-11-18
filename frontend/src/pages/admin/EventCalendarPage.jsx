import { useMemo, useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import DateTile from '../../components/ui/DateTile.jsx';
import ListRow from '../../components/ui/ListRow.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import MonthCalendar, { groupByDay } from '../../components/common/MonthCalendar.jsx';
import EventModal from '../../components/modals/EventModal.jsx';
import { usePageMeta } from '../../context/AdminShellContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { EVENT_KINDS } from '../../data/events.js';
import { PROTOTYPE_TODAY } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';

export default function EventCalendarPage() {
  usePageMeta('Event calendar', 'Overview');
  const toast = useToast();
  const { events, addEvent } = useData();
  const [hidden, setHidden] = useState([]);
  const [day, setDay] = useState(null);
  const [adding, setAdding] = useState(false);

  const visible = useMemo(() => events.filter((e) => !hidden.includes(e.kind)), [events, hidden]);
  const listed = (day
    ? visible.filter((e) => e.day === day)
    : visible.filter((e) => e.day >= PROTOTYPE_TODAY.day && e.kind !== 'mass')
  ).slice().sort((a, b) => a.day - b.day);

  const toggleKind = (kind) => setHidden((h) => (h.includes(kind) ? h.filter((k) => k !== kind) : [...h, kind]));

  return (
    <>
      <PageHeader title="Event calendar" subtitle="Masses, sacramental rites and parish activities in one view." actions={<Button onClick={() => setAdding(true)}><Plus size={17} aria-hidden="true" /> Add event</Button>} />
      <div className="mb-3.5 flex flex-wrap gap-2" role="group" aria-label="Show event types">
        {Object.entries(EVENT_KINDS).map(([kind, { label, color }]) => {
          const off = hidden.includes(kind);
          return (
            <button key={kind} type="button" aria-pressed={!off} onClick={() => toggleKind(kind)} className={cn('inline-flex items-center gap-[7px] rounded-full border border-line-2 bg-white px-3 py-[5px] text-[12.5px] font-medium', off && 'text-ink-3 line-through opacity-60')}>
              <i className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} aria-hidden="true" />{label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_420px] items-start gap-5 max-lg:grid-cols-1">
        <MonthCalendar itemsByDay={groupByDay(visible)} selectedDay={day} onSelectDay={(d) => setDay((c) => (c === d ? null : d))} onToday={() => setDay(null)} />
        <Card>
          <CardHeader title={day ? `October ${day}` : 'Coming up'} />
          {listed.length ? listed.map((e) => (
            <ListRow key={e.id}>
              <DateTile day={e.day} />
              <div><b>{e.title}</b><div className="text-[12.5px] text-ink-2">{e.time}, {e.location ?? 'St. Isidore Parish Church'}</div></div>
              <span className="flex-1" />
              <i className="h-2.5 w-2.5 rounded-[3px]" style={{ background: EVENT_KINDS[e.kind].color }} aria-hidden="true" />
            </ListRow>
          )) : (
            <EmptyState icon={CalendarDays} title="Nothing scheduled" description="No events match this date and filter." action={<Button variant="secondary" onClick={() => setAdding(true)}>Add event</Button>} />
          )}
        </Card>
      </div>

      {adding && <EventModal onClose={() => setAdding(false)} onSubmit={(e) => { addEvent(e); setAdding(false); toast('Event added to the calendar'); }} />}
    </>
  );
}
