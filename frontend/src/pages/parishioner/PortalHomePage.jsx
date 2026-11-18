import { Link, useNavigate } from 'react-router-dom';
import { Award, ChevronRight, Plus } from 'lucide-react';
import PortalPage, { PortalHero } from '../../components/layout/PortalPage.jsx';
import FeaturedAppointment from '../../components/common/FeaturedAppointment.jsx';
import { Card, CardBody, CardHeader, linkClass } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import DateTile from '../../components/ui/DateTile.jsx';
import ListRow from '../../components/ui/ListRow.jsx';
import SacramentIcon from '../../components/ui/SacramentIcon.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { PORTAL_MASS_SCHEDULE } from '../../data/parish.js';
import { firstName } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

function Stat({ value, label, to }) {
  const classes = cn('rounded-xl border border-line bg-white px-[18px] py-4 text-left max-sm:p-3.5', to && 'hover:border-wine-2');
  const body = (<><div className="font-serif text-[30px] font-semibold leading-[1.1] tabular-nums max-sm:text-[26px]">{value}</div><div className="text-[13px] text-ink-2">{label}</div></>);
  return to ? <Link to={to} className={cn(classes, 'block no-underline')}>{body}</Link> : <div className={classes}>{body}</div>;
}

export default function PortalHomePage() {
  const { parishioner } = useAuth();
  const navigate = useNavigate();
  const { myRequests, userConversations, certificates, appointments, events } = useData();
  const unread = userConversations.reduce((n, c) => n + c.unread, 0);
  const pending = myRequests.filter((r) => r.status === 'pending').length;
  const nextAppointment = appointments.find((a) => !['completed', 'cancelled'].includes(a.status));
  const upcoming = appointments.filter((a) => !['completed', 'cancelled'].includes(a.status)).length;
  const featured = nextAppointment ? { ...nextAppointment, title: nextAppointment.title || nextAppointment.type, month: new Date(nextAppointment.start_at).toLocaleString(undefined, { month: 'short' }), weekday: new Date(nextAppointment.start_at).toLocaleString(undefined, { weekday: 'long' }), time: `${new Date(nextAppointment.start_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}, ${nextAppointment.time}`, place: nextAppointment.details?.place || 'St. Isidore Parish Church', priest: nextAppointment.priest, people: nextAppointment.who, status: nextAppointment.status } : null;
  const readyCount = certificates.filter((c) => c.name === parishioner.name && c.status === 'ready').length;

  return (
    <PortalPage
      hero={(
        <PortalHero
          title={`Welcome back, ${firstName(parishioner.name)}`}
          subtitle="Here is what is happening with your parish requests."
          action={<Button size="lg" to="/portal/requests/new"><Plus size={18} aria-hidden="true" /> New request</Button>}
        />
      )}
    >
      <div className="-mt-1.5 grid grid-cols-4 gap-4 max-md:grid-cols-2 max-md:gap-3">
        <Stat value={myRequests.length} label="My requests" />
        <Stat value={pending} label="Pending requests" to="/portal/requests" />
        <Stat value={upcoming} label="Upcoming appointments" to="/portal/appointments" />
        <Stat value={unread} label="Unread messages" to="/portal/messages" />
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_350px] items-start gap-5 max-lg:grid-cols-1">
        <div className="flex flex-col gap-5">
          {featured ? <FeaturedAppointment appointment={featured} actions={<Button variant="on-wine" to="/portal/appointments">View details</Button>} /> : <Card><CardBody>No upcoming appointments yet.</CardBody></Card>}
          <Card>
            <CardHeader title="Recent requests" action={<Link to="/portal/requests" className={linkClass}>See all</Link>} />
            {myRequests.slice(0, 2).map((r) => (
              <ListRow key={r.id} onClick={() => navigate('/portal/requests')} className="!px-5 !py-4">
                <SacramentIcon name={r.type} size={40} />
                <div><b>{r.title}</b><div className="text-[12.5px] text-ink-2">{r.id}</div></div>
                <span className="flex-1" />
                <StatusBadge status={r.status} />
              </ListRow>
            ))}
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Upcoming parish events" />
            {events.filter((e) => e.status === 'upcoming').slice(0, 4).map((e) => (
              <ListRow key={e.id}><DateTile day={e.day} month={e.month} /><div><b>{e.title}</b><div className="text-[12.5px] text-ink-2">{e.time}, {e.location}</div></div></ListRow>
            ))}
          </Card>
          <Card>
            <CardHeader title="Sunday Mass schedule" />
            <CardBody className="flex flex-col gap-2">
              {PORTAL_MASS_SCHEDULE.map(([day, time]) => (
                <div key={day} className="flex items-center gap-3"><span className="text-ink-2">{day}</span><span className="flex-1" /><b>{time}</b></div>
              ))}
            </CardBody>
          </Card>
          <Card>
            <ListRow onClick={() => navigate('/portal/certificates')} className="!py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gold-1 text-gold-d"><Award size={20} aria-hidden="true" /></div>
              <div>
                <b>{readyCount ? `${readyCount} certificate${readyCount > 1 ? 's' : ''} ready for pickup` : 'Certificate status'}</b>
                <div className="text-[12.5px] text-ink-2">See certificate status</div>
              </div>
              <span className="flex-1" />
              <ChevronRight size={18} aria-hidden="true" />
            </ListRow>
          </Card>
        </div>
      </div>
    </PortalPage>
  );
}
