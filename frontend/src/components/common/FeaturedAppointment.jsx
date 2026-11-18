import { Clock, MapPin, User, Users } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';

/** Wine gradient card for the parishioner's next appointment. `actions` are rendered under the details. */
export default function FeaturedAppointment({ appointment: a, variant = 'summary', actions }) {
  const full = variant === 'full';
  const start = new Date(a.start_at || a.date || Date.now());
  const daysToGo = Math.max(0, Math.ceil((start.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000));
  return (
    <div className="flex items-start gap-[18px] rounded-[14px] bg-hero-wine p-[22px] text-white max-sm:flex-col">
      <div className="min-w-[68px] flex-none rounded-xl bg-white/[.14] px-3.5 py-2.5 text-center leading-[1.15]" aria-hidden="true">
        <small className="block text-xs">{a.month}</small>
        <b className="block font-serif text-[28px] font-semibold">{a.day}</b>
        <small className="block text-xs">{a.weekday}</small>
      </div>
      <div className="min-w-0 flex-1">
        {full ? (
          <>
            <div className="flex flex-wrap items-center gap-3"><h3 className="!text-white">{a.title}</h3><Badge className="bg-white/[.18] text-white">{a.status || 'Scheduled'}</Badge></div>
            <p className="mt-0.5 text-wine-2">{daysToGo} days to go</p>
          </>
        ) : (
          <>
            <span className="text-[12.5px] text-wine-2">Your next appointment</span>
            <h3 className="mt-0.5 !text-white">{a.title}</h3>
          </>
        )}
        <div className="mt-3.5 flex flex-col gap-2 text-[#F3E7E9]">
          {full ? (
            <>
              <Line icon={Clock}>{a.time}</Line>
              <Line icon={MapPin}>{a.place}</Line>
              <Line icon={User}>{a.priest}</Line>
              <Line icon={Users}>{a.people}</Line>
            </>
          ) : (
            <>
              <Line icon={Clock}>{start.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}, {start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Line>
              <Line icon={MapPin}>{a.place || 'St. Isidore Parish Church'}</Line>
            </>
          )}
        </div>
        <div className="mt-[18px] flex flex-wrap gap-2.5">{actions}</div>
      </div>
    </div>
  );
}

const Line = ({ icon: Icon, children }) => <span className="flex items-center gap-2"><Icon size={17} aria-hidden="true" />{children}</span>;
