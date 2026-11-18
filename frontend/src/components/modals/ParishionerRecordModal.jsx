import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Tabs from '../ui/Tabs.jsx';
import Timeline from '../ui/Timeline.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { StatusBadge } from '../ui/Badge.jsx';
import { useData } from '../../context/DataContext.jsx';

/** Full record: sacrament, request and appointment history for one parishioner. */
export default function ParishionerRecordModal({ parishioner: p, onClose }) {
  const { requests, appointments } = useData();
  const [tab, setTab] = useState('Sacraments');
  const surname = p.name.split(' ').pop();
  const myRequests = requests.filter((r) => r.applicant === p.name);
  const myAppointments = appointments.filter((a) => a.who.includes(surname));

  return (
    <Modal open onClose={onClose} size="lg" title={`${p.name}, full record`} footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>
      <Tabs tabs={['Sacraments', 'Requests', 'Appointments']} value={tab} onChange={setTab} />
      {tab === 'Sacraments' && (
        <Timeline items={p.history.map((h, i) => ({
          state: p.received[i] ? 'done' : undefined,
          content: <b className={p.received[i] ? '' : 'font-medium text-ink-3'}>{h.sacrament}</b>,
          meta: p.received[i] ? `${h.date}, ${h.place}` : 'Not yet received',
        }))} />
      )}
      {tab === 'Requests' && (myRequests.length ? (
        <div className="flex flex-col gap-2.5">
          {myRequests.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-[10px] border border-line px-3 py-2.5">
              <div><b>{r.type} request</b><div className="text-[12.5px] text-ink-2 tabular-nums">{r.id}, submitted {r.submitted}</div></div>
              <span className="flex-1" /><StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      ) : <EmptyState title="No requests on record" description="This parishioner has not submitted a request." />)}
      {tab === 'Appointments' && (myAppointments.length ? (
        <div className="flex flex-col gap-2.5">
          {myAppointments.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-[10px] border border-line px-3 py-2.5">
              <div><b>{a.title}</b><div className="text-[12.5px] text-ink-2">Oct {a.day}, {a.time}, {a.priest}</div></div>
              <span className="flex-1" /><StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      ) : <EmptyState title="No appointments on record" description="Nothing is scheduled for this family." />)}
    </Modal>
  );
}
