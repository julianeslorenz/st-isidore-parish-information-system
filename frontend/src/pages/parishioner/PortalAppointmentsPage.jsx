import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import PortalPage from '../../components/layout/PortalPage.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import FeaturedAppointment from '../../components/common/FeaturedAppointment.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import DateTile from '../../components/ui/DateTile.jsx';
import ListRow from '../../components/ui/ListRow.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { CheckboxField, TextareaField, TextField } from '../../components/ui/Field.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useData } from '../../context/DataContext.jsx';

export default function PortalAppointmentsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [rescheduling, setRescheduling] = useState(false);
  const [preferredDate, setPreferredDate] = useState('');
  const [reason, setReason] = useState('');
  const { appointments, requestReschedule } = useData();
  useEffect(() => {
    if (!location.state?.select || !appointments.some((appointment) => appointment.id === location.state.select)) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [appointments, location.pathname, location.state, navigate]);
  const scheduled = appointments.filter((a) => !['completed', 'cancelled'].includes(a.status));
  const first = appointments.find((a) => a.id === location.state?.select) || scheduled[0];
  const date = first ? new Date(first.start_at) : null;
  const featured = first ? { ...first, title: first.title || first.type, month: date.toLocaleString(undefined, { month: 'short' }), weekday: date.toLocaleString(undefined, { weekday: 'long' }), time: `${date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}, ${first.time}`, place: first.details?.place || 'St. Isidore Parish Church', priest: first.priest || 'Parish office', people: first.who || '', status: first.status } : null;
  const others = scheduled.filter((a) => a.id !== first?.id).map((a) => { const d = new Date(a.start_at); return { ...a, month: d.toLocaleString(undefined, { month: 'short' }), day: d.getDate(), meta: `${a.time}, ${a.priest || 'Parish office'}` }; });
  const bring = first?.details?.requirements || [];
  const submitReschedule = async () => {
    if (!first || !preferredDate || !reason.trim()) return;
    const result = await requestReschedule(first.id, `${preferredDate}T09:00:00`, reason.trim());
    if (result) { setRescheduling(false); toast('Reschedule request sent to the parish office'); }
  };

  return (
    <PortalPage>
      <PageHeader title="My appointments" subtitle="Your scheduled visits and rites at the parish." />
      <div className="grid grid-cols-[minmax(0,1fr)_350px] items-start gap-5 max-lg:grid-cols-1">
        {featured ? <FeaturedAppointment
          variant="full"
          appointment={featured}
          actions={(
            <>
              <Button variant="on-wine" onClick={() => toast('Added to your calendar')}><CalendarDays size={17} aria-hidden="true" /> Add to calendar</Button>
              <Button variant="on-wine-outline" onClick={() => setRescheduling(true)}>Request to reschedule</Button>
            </>
          )}
        /> : <Card><CardBody>No appointments have been scheduled yet.</CardBody></Card>}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Please bring" />
            <CardBody className="flex flex-col gap-2.5">{bring.map((item) => <CheckboxField key={item} className="items-center">{item}</CheckboxField>)}</CardBody>
          </Card>
          <Card>
            <CardHeader title="Arrive early" />
            <CardBody className="text-ink-2">Please arrive 20 minutes before your time so the priest can meet your family.</CardBody>
          </Card>
        </div>
      </div>

      <h3 className="mb-3 mt-[30px]">Other appointments</h3>
      <Card>
        {others.map((a) => (
          <ListRow key={a.title} className="!px-5 !py-3.5">
            <DateTile month={a.month} day={a.day} />
            <div><b>{a.title}</b><div className="text-[12.5px] text-ink-2">{a.meta}</div></div>
            <span className="flex-1" />
            <StatusBadge status={a.status} />
          </ListRow>
        ))}
      </Card>

      {rescheduling && (
        <Modal
          open
          onClose={() => setRescheduling(false)}
          title="Request to reschedule"
          footer={<><Button variant="secondary" onClick={() => setRescheduling(false)}>Cancel</Button><Button onClick={submitReschedule}>Send request</Button></>}
        >
          <div className="flex flex-col gap-3.5">
            <TextField label="Preferred new date" type="date" min={new Date().toISOString().slice(0, 10)} value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
            <TextareaField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Tell the parish office why you need to move the date" />
            <p className="text-[12.5px] text-ink-2">The parish office will confirm the new schedule with you. Your current appointment stays in place until then.</p>
          </div>
        </Modal>
      )}
    </PortalPage>
  );
}
