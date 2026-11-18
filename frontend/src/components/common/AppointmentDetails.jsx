import { CalendarDays, Check, X } from 'lucide-react';
import Button from '../ui/Button.jsx';
import KeyValue from '../ui/KeyValue.jsx';
import { StatusBadge, Tag } from '../ui/Badge.jsx';
import { EVENT_KINDS } from '../../data/events.js';

/** Appointment summary + actions. Used in the side card on desktop and the bottom sheet on phones. */
export default function AppointmentDetails({ appointment: a, onConfirm, onReschedule, onCancel }) {
  const color = EVENT_KINDS[a.kind].color;
  return (
    <>
      <div className="mb-1.5 flex flex-wrap items-center gap-3"><Tag color={color}>{a.type}</Tag><StatusBadge status={a.status} /></div>
      <h3 className="mb-3.5 mt-2">{a.title}</h3>
      <KeyValue labelWidth={80} items={[['Date', `Oct ${a.day}, 2026`], ['Time', a.time], ['With', a.who], ['Priest', a.priest], ['Venue', 'St. Isidore Parish Church']]} />
      <p className="my-3.5 rounded-lg bg-paper px-3 py-2.5 text-[12.5px] text-ink-2">{a.note}</p>
      <div className="flex flex-col gap-2">
        {a.status === 'pending' && <Button variant="success" onClick={onConfirm}><Check size={17} aria-hidden="true" /> Confirm appointment</Button>}
        {a.status !== 'cancelled' && <Button variant="secondary" onClick={onReschedule}><CalendarDays size={17} aria-hidden="true" /> Reschedule</Button>}
        {a.status !== 'cancelled' && <Button variant="danger" onClick={onCancel}><X size={17} aria-hidden="true" /> Cancel appointment</Button>}
      </div>
    </>
  );
}
