import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Plus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import DateTile from '../../components/ui/DateTile.jsx';
import ListRow from '../../components/ui/ListRow.jsx';
import Timeline from '../../components/ui/Timeline.jsx';
import { Card, CardBody, CardHeader, linkClass } from '../../components/ui/Card.jsx';
import { StatusBadge, Tag } from '../../components/ui/Badge.jsx';
import { BarChart, DonutChart } from '../../components/common/Charts.jsx';
import AppointmentModal from '../../components/modals/AppointmentModal.jsx';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../context/AdminShellContext.jsx';
import { canOpenScreen, useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { DASHBOARD_DONUT } from '../../data/reports.js';
import { EVENT_KINDS } from '../../data/events.js';
import { Icons } from '../../utils/icons.js';
import { firstName } from '../../utils/format.js';

export default function DashboardPage() {
  usePageMeta('Dashboard', 'Overview');
  const { admin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { requests, appointments, events, dashboard, report, addAppointment } = useData();
  const [scheduling, setScheduling] = useState(false);

  const canRequests = canOpenScreen(admin, 'requests');
  const canAppointments = canOpenScreen(admin, 'appointments');
  const canEvents = canOpenScreen(admin, 'events');
  // Priests only see their own appointments (role rule from the user accounts screen).
  const myAppointments = appointments;
  const pending = requests.filter((r) => r.status === 'pending').slice(0, 4);
  const upcomingEvents = events.filter((e) => e.status === 'upcoming' && new Date(e.starts_at) >= new Date()).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)).slice(0, 4);
  const dashboardStats = [
    { icon: 'users', value: dashboard?.parishioners ?? 0, label: 'Total parishioners', detail: 'Registered accounts' },
    { icon: 'file', value: dashboard?.pending_requests ?? 0, label: 'Pending requests', detail: 'Awaiting parish review', tone: 'warn' },
    { icon: 'cal', value: dashboard?.appointments ?? 0, label: 'Upcoming appointments', detail: 'Scheduled visits' },
    { icon: 'star', value: dashboard?.upcoming_events ?? 0, label: 'Upcoming events', detail: 'On the parish calendar' },
  ];
  const monthlyBars = (report?.months || []).map((m) => ({ label: m.label, value: m.count }));
  const donutSegments = (report?.sacraments || []).filter((item) => item.count > 0).map((item) => ({ ...item, color: DASHBOARD_DONUT.find((part) => part.label === item.label)?.color || '#9A918A' }));
  const activity = requests.slice(0, 4).map((request) => ({
    state: 'done', meta: request.submitted ? new Date(request.submitted).toLocaleString() : '',
    content: <><b>{request.applicant}</b> submitted a {request.type.toLowerCase()} request</>,
  }));

  return (
    <>
      <PageHeader
        title={`Good morning, ${firstName(admin.name)}`}
        subtitle={`${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. Here is what needs attention today.`}
        actions={(
          <>
            <Button variant="secondary" onClick={() => toast('Report exported as PDF')}><Download size={17} aria-hidden="true" /> Export report</Button>
            {canAppointments && <Button onClick={() => setScheduling(true)}><Plus size={17} aria-hidden="true" /> New appointment</Button>}
          </>
        )}
      />

      <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:gap-3">
        {dashboardStats.map((s) => <StatCard key={s.label} icon={Icons[s.icon]} value={s.value} label={s.label} detail={s.detail} tone={s.tone} />)}
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_420px] items-start gap-5 max-lg:grid-cols-1">
        <Card><CardHeader title="Requests received" action={<Tag>Last 6 months</Tag>} /><CardBody><BarChart data={monthlyBars} label="Requests received in the last 6 months" /></CardBody></Card>
        <Card><CardHeader title="By sacrament" /><CardBody><DonutChart segments={donutSegments} centerValue={String(report?.total ?? 0)} centerLabel="requests" label="Requests by sacrament" /></CardBody></Card>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-5 max-md:grid-cols-1">
        <Card>
          <CardHeader title="Pending requests" action={canRequests && <Link to="/admin/requests" className={linkClass}>View all</Link>} />
          {pending.map((r) => (
            <ListRow key={r.id} onClick={canRequests ? () => navigate(`/admin/requests/${r.id}`) : undefined}>
              <Avatar name={r.applicant} size={38} />
              <div className="min-w-0"><b>{r.applicant}</b><div className="text-[12.5px] text-ink-2">Baptism request, {r.id}</div></div>
              <span className="flex-1" /><StatusBadge status="pending" />
            </ListRow>
          ))}
        </Card>
        <Card>
          <CardHeader title="Upcoming appointments" action={canAppointments && <Link to="/admin/appointments" className={linkClass}>Open calendar</Link>} />
          {myAppointments.slice(0, 4).map((a) => (
            <ListRow key={a.id} onClick={canAppointments ? () => navigate('/admin/appointments', { state: { select: a.id } }) : undefined}>
              <DateTile day={a.day} month={new Date(a.start_at).toLocaleString(undefined, { month: 'short' })} />
              <div className="min-w-0"><b>{a.title}</b><div className="text-[12.5px] text-ink-2">{a.time}, {a.who}</div></div>
              <span className="flex-1" /><span className="text-[12.5px] text-ink-3 max-md:hidden">{a.priest}</span>
            </ListRow>
          ))}
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-5 max-md:grid-cols-1">
        <Card>
          <CardHeader title="Upcoming events" action={canEvents && <Link to="/admin/events" className={linkClass}>View calendar</Link>} />
          {upcomingEvents.map((e) => (
            <ListRow key={e.id}>
              <DateTile day={e.day} month={e.month} />
              <div><b>{e.title}</b><div className="text-[12.5px] text-ink-2">{e.time}</div></div>
              <span className="flex-1" />
              <i className="h-2.5 w-2.5 rounded-[3px]" style={{ background: EVENT_KINDS[e.kind]?.color || '#9A918A' }} aria-hidden="true" />
            </ListRow>
          ))}
        </Card>
        <Card>
          <CardHeader title="Recent activity" />
          <CardBody>
            {activity.length ? <Timeline items={activity} /> : <p className="text-[13px] text-ink-2">No recent requests yet.</p>}
          </CardBody>
        </Card>
      </div>

      {scheduling && (
        <AppointmentModal onClose={() => setScheduling(false)} onSubmit={(a) => { addAppointment(a); setScheduling(false); toast('Appointment scheduled'); }} />
      )}
    </>
  );
}
