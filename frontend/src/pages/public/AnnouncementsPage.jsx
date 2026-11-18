import { AnnouncementCard, PageHero, Section } from '../../components/common/PublicCards.jsx';
import { ANNOUNCEMENTS } from '../../data/announcements.js';

export default function AnnouncementsPage() {
  return (
    <>
      <PageHero title="Announcements" subtitle="News and notices from the parish office." />
      <Section>
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          {ANNOUNCEMENTS.map((a) => <AnnouncementCard key={a.id} item={a} />)}
        </div>
      </Section>
    </>
  );
}
