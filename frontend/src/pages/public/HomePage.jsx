import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Container from '../../components/ui/Container.jsx';
import { Tag } from '../../components/ui/Badge.jsx';
import SacramentIcon from '../../components/ui/SacramentIcon.jsx';
import { AnnouncementCard, EventCard, InfoCard, Section, SectionHeading } from '../../components/common/PublicCards.jsx';
import EventDetailModal from '../../components/modals/EventDetailModal.jsx';
import { useRequestSacrament } from '../../hooks/useRequestSacrament.jsx';
import { ANNOUNCEMENTS } from '../../data/announcements.js';
import { useData } from '../../context/DataContext.jsx';
import { SACRAMENTS } from '../../data/sacraments.js';
import { MASS_SCHEDULE, OFFICE_HOURS, PARISH } from '../../data/parish.js';
import { useState } from 'react';

export default function HomePage() {
  const { requestSacrament, dialog, isSignedIn } = useRequestSacrament();
  const [openEvent, setOpenEvent] = useState(null);
  const { events } = useData();

  return (
    <>
      <section className="bg-hero-wine py-[68px] max-md:py-10">
        <Container>
          <Tag className="bg-white/[.14] text-gold-1">Official parish portal</Tag>
          <h1 className="mt-3.5 max-w-[640px] text-[44px] leading-[1.1] !text-white max-md:text-[30px]">Welcome to St. Isidore Parish</h1>
          <p className="mb-[26px] mt-3.5 max-w-[560px] text-[17px] text-wine-2">
            Request sacraments, follow the parish schedule and stay close to our community, from wherever you are.
          </p>
          <div className="flex flex-wrap gap-2.5 max-sm:[&>*]:flex-[1_1_100%]">
            <Button variant="gold" size="lg" onClick={() => requestSacrament()}>Request a sacrament</Button>
            <Button variant="on-wine-outline" size="lg" to="/schedule">View parish schedule</Button>
            <Button variant="on-wine-outline" size="lg" to="/events">View events</Button>
          </div>
          {!isSignedIn && (
            <p className="mt-[18px] text-[12.5px] text-[#D9C3C7]">
              Already registered? <Link to="/login" className="text-gold-1 underline">Login</Link> or <Link to="/register" className="text-gold-1 underline">create an account</Link>.
            </p>
          )}
        </Container>
      </section>

      <Section>
        <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          <InfoCard title="Mass schedule" icon={Clock} rows={MASS_SCHEDULE} />
          <InfoCard title="Office hours" icon={CalendarDays} rows={OFFICE_HOURS} />
          <InfoCard title="Visit us" icon={MapPin} rows={[['Address', PARISH.address], ['Phone', PARISH.phone], ['Email', PARISH.email]]} />
        </div>
      </Section>

      <Section alt>
        <SectionHeading title="Announcements" subtitle="The latest from the parish office." link={{ to: '/announcements', label: 'All announcements' }} />
        <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          {ANNOUNCEMENTS.slice(0, 3).map((a) => <AnnouncementCard key={a.id} item={a} />)}
        </div>
      </Section>

      <Section>
        <SectionHeading title="Upcoming events" subtitle="Open to all parishioners and visitors." link={{ to: '/events', label: 'All events' }} />
        <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          {events.filter((e) => e.status === 'upcoming').slice(0, 3).map((e) => <EventCard key={e.id} event={e} onOpen={setOpenEvent} />)}
        </div>
      </Section>

      <Section alt>
        <h2 className="mb-1.5 text-[26px]">Sacraments and services</h2>
        <p className="mb-[22px] text-ink-2">Learn what each sacrament needs before you begin.</p>
        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:gap-3">
          {Object.entries(SACRAMENTS).map(([name, s]) => (
            <Link key={name} to="/sacraments" className="flex flex-col items-start gap-3.5 rounded-[14px] border-[1.5px] border-line bg-white p-[18px] text-left no-underline hover:border-wine-2">
              <SacramentIcon name={name} />
              <span>
                <b className="text-[15px] text-ink">{name}</b>
                <span className="mt-0.5 block text-[12.5px] text-ink-2">{s.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {openEvent && <EventDetailModal event={openEvent} onClose={() => setOpenEvent(null)} />}
      {dialog}
    </>
  );
}
