import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Star } from 'lucide-react';
import { InfoCard, PageHero, Section } from '../../components/common/PublicCards.jsx';
import { MASS_SCHEDULE, OFFICE_HOURS, REGULAR_ACTIVITIES } from '../../data/parish.js';

export default function SchedulePage() {
  return (
    <>
      <PageHero title="Parish schedule" subtitle="Mass times, office hours and regular activities." />
      <Section>
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          <div className="flex flex-col gap-5">
            <InfoCard title="Mass schedule" icon={Clock} rows={MASS_SCHEDULE} />
            <InfoCard title="Parish office hours" icon={CalendarDays} rows={OFFICE_HOURS} />
          </div>
          <InfoCard title="Regular activities" icon={Star} rows={REGULAR_ACTIVITIES} />
        </div>
        <p className="mt-4 text-[12.5px] text-ink-3">
          Private appointments are not shown here. Special Mass times are posted under <Link to="/announcements" className="font-medium text-wine no-underline hover:underline">Announcements</Link>.
        </p>
      </Section>
    </>
  );
}
