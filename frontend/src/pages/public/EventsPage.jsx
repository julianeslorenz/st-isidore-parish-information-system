import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { CategoryChips } from '../../components/ui/FilterChips.jsx';
import { EventCard, PageHero, Section } from '../../components/common/PublicCards.jsx';
import EventDetailModal from '../../components/modals/EventDetailModal.jsx';
import { PUBLIC_EVENT_CATEGORIES } from '../../data/events.js';
import { useData } from '../../context/DataContext.jsx';

export default function EventsPage() {
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const { events: allEvents } = useData();
  const events = allEvents.filter((e) => category === 'All' || e.category === category);

  return (
    <>
      <PageHero title="Parish events" subtitle="Open events for parishioners and visitors." />
      <Section>
        <CategoryChips options={PUBLIC_EVENT_CATEGORIES} value={category} onChange={setCategory} />
        <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          {events.map((e) => <EventCard key={e.id} event={e} onOpen={setSelected} />)}
        </div>
        {!events.length && (
          <EmptyState icon={CalendarDays} title="No events in this category" description="Try another category." action={<Button variant="secondary" onClick={() => setCategory('All')}>Show all</Button>} />
        )}
      </Section>
      {selected && <EventDetailModal event={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
