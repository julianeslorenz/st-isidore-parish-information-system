import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, Plus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ListRow from '../../components/ui/ListRow.jsx';
import Modal, { ConfirmModal } from '../../components/ui/Modal.jsx';
import SegmentedControl from '../../components/ui/SegmentedControl.jsx';
import { Card, CardHeader, linkClass } from '../../components/ui/Card.jsx';
import { Select } from '../../components/ui/Field.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import MonthCalendar, { groupByDay } from '../../components/common/MonthCalendar.jsx';
import AppointmentDetails from '../../components/common/AppointmentDetails.jsx';
import AppointmentModal from '../../components/modals/AppointmentModal.jsx';
import { usePageMeta } from '../../context/AdminShellContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useIsMobile } from '../../hooks/useMediaQuery.js';
import { EVENT_KINDS } from '../../data/events.js';
import { STATUS_LABELS } from '../../data/statuses.js';
import { PROTOTYPE_TODAY } from '../../utils/constants.js';

const TYPES = ['all', 'Baptism', 'Marriage', 'Confirmation', 'Funeral'];
const PRIESTS = ['all', 'Fr. Antonio Reyes', 'Fr. Miguel Santos', 'Parish office'];
const STATUSES = ['all', 'confirmed', 'pending', 'cancelled'];

export default function AppointmentsPage() {
  usePageMeta('Appointments', 'Appointments');
  const { admin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const isMobile = useIsMobile();
  const { appointments, addAppointment, updateAppointment } = useData();
  const isPriest = admin.role === 'Priest';

  const [filters, setFilters] = useState({ type: 'all', priest: 'all', status: 'all' });
  const [view, setView] = useState('month');
  const [day, setDay] = useState(null);
  const [selectedId, setSelectedId] = useState(location.state?.select ?? null);
  const [dialog, setDialog] = useState(null); // 'new' | 'reschedule' | 'cancel' | 'sheet'

  useEffect(() => {
    const requested = base.find((appointment) => appointment.id === location.state?.select);
    if (!requested) return;
    setSelectedId(requested.id);
    if (isMobile) setDialog('sheet');
    navigate(location.pathname, { replace: true, state: null });
  }, [base, isMobile, location.pathname, location.state, navigate]);

  // Priests only manage their own appointments.
  const base = useMemo(() => (isPriest ? appointments.filter((a) => a.priest === admin.name) : appointments), [appointments, isPriest, admin.name]);
  const matching = useMemo(() => base.filter((a) => (
    (filters.type === 'all' || a.type === filters.type)
    && (filters.priest === 'all' || a.priest === filters.priest)
    && (filters.status === 'all' || a.status === filters.status)
  )), [base, filters]);
  const list = day ? matching.filter((a) => a.day === day) : matching;
  const selected = base.find((a) => a.id === selectedId) ?? base[0];

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));
  const select = (a) => { setSelectedId(a.id); if (isMobile) setDialog('sheet'); };
  const chooseDay = (d) => setDay((current) => (current === d ? null : d));

  const details = selected && (
    <AppointmentDetails
      appointment={selected}
      onConfirm={() => { updateAppointment(selected.id, { status: 'confirmed' }); setDialog(null); toast('Appointment confirmed and parishioner notified'); }}
      onReschedule={() => setDialog('reschedule')}
      onCancel={() => setDialog('cancel')}
    />
  );

  const columns = [
    { key: 'date', header: 'Date', first: true, className: 'tabular-nums', render: (a) => <><b>Oct {a.day}</b> <span className="text-ink-2">{a.time}</span></> },
    { key: 'type', header: 'Appointment', label: 'Type', render: (a) => a.title },
    { key: 'who', header: 'With', className: 'text-ink-2', render: (a) => a.who },
    { key: 'priest', header: 'Priest', className: 'text-ink-2', render: (a) => a.priest },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle="Interviews, seminars and rites scheduled with the priests."
        actions={!isPriest && <Button onClick={() => setDialog('new')}><Plus size={17} aria-hidden="true" /> New appointment</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <Select aria-label="Appointment type" className="w-auto" value={filters.type} onChange={setFilter('type')}>
          {TYPES.map((o) => <option key={o} value={o}>{o === 'all' ? 'All types' : o}</option>)}
        </Select>
        {!isPriest && (
          <Select aria-label="Priest" className="w-auto" value={filters.priest} onChange={setFilter('priest')}>
            {PRIESTS.map((o) => <option key={o} value={o}>{o === 'all' ? 'All priests' : o}</option>)}
          </Select>
        )}
        <Select aria-label="Status" className="w-auto" value={filters.status} onChange={setFilter('status')}>
          {STATUSES.map((o) => <option key={o} value={o}>{o === 'all' ? 'All statuses' : STATUS_LABELS[o]}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_420px] items-start gap-5 max-lg:grid-cols-1">
        <div>
          {view === 'month' ? (
            <>
              <MonthCalendar
                itemsByDay={groupByDay(matching)}
                selectedDay={day}
                onSelectDay={chooseDay}
                onToday={() => setDay(PROTOTYPE_TODAY.day)}
                actions={<SegmentedControl label="View" options={[{ value: 'month', label: 'Month' }, { value: 'list', label: 'List' }]} value={view} onChange={setView} />}
              />
              {list.length > 0 && (
                <Card className="mt-4">
                  <CardHeader title={day ? `Oct ${day}` : 'All upcoming'} action={day && <button type="button" className={linkClass} onClick={() => setDay(null)}>Show all</button>} />
                  {list.slice(0, 5).map((a) => (
                    <ListRow key={a.id} onClick={() => select(a)}>
                      <i className="h-9 w-1 rounded-sm" style={{ background: EVENT_KINDS[a.kind].color }} aria-hidden="true" />
                      <div className="min-w-0"><b>{a.title}</b><div className="text-[12.5px] text-ink-2">Oct {a.day}, {a.time}, {a.who}</div></div>
                      <span className="flex-1" /><StatusBadge status={a.status} />
                    </ListRow>
                  ))}
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardHeader title="All appointments" action={<SegmentedControl label="View" options={[{ value: 'month', label: 'Month' }, { value: 'list', label: 'List' }]} value={view} onChange={setView} />} />
              {list.length
                ? <DataTable columns={columns} rows={list} getRowKey={(a) => a.id} selectedKey={selected?.id} onRowClick={select} caption="Appointments" />
                : <EmptyState icon={CalendarDays} title="No appointments found" description="Change the filters or pick another date." />}
            </Card>
          )}
        </div>
        {selected && (
          <Card className="sticky top-0 max-md:hidden">
            <CardHeader title="Appointment details" />
            <div className="p-5">{details}</div>
          </Card>
        )}
      </div>

      {dialog === 'sheet' && selected && <Modal open onClose={() => setDialog(null)} title="Appointment details">{details}</Modal>}
      {dialog === 'new' && <AppointmentModal onClose={() => setDialog(null)} onSubmit={(a) => { addAppointment(a); setDialog(null); toast('Appointment scheduled'); }} />}
      {dialog === 'reschedule' && selected && (
        <AppointmentModal mode="reschedule" appointment={selected} onClose={() => setDialog(null)} onSubmit={(patch) => { updateAppointment(selected.id, patch); setDialog(null); toast('Appointment rescheduled'); }} />
      )}
      <ConfirmModal open={dialog === 'cancel'} onClose={() => setDialog(null)} tone="danger" title="Cancel this appointment?" cancelLabel="Keep" confirmLabel="Cancel appointment" onConfirm={() => { updateAppointment(selected.id, { status: 'cancelled' }); setDialog(null); toast('Appointment cancelled'); }}>
        The parishioner will be told that this appointment was cancelled.
      </ConfirmModal>
    </>
  );
}
