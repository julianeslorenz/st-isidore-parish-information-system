import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Tag } from '../../components/ui/Badge.jsx';
import Container from '../../components/ui/Container.jsx';
import { ANNOUNCEMENTS } from '../../data/announcements.js';
import NotFoundPage from './NotFoundPage.jsx';

export default function AnnouncementDetailPage() {
  const { id } = useParams();
  const item = ANNOUNCEMENTS.find((a) => String(a.id) === id);
  if (!item) return <NotFoundPage />;
  return (
    <section className="py-11">
      <Container className="!max-w-[760px]">
        <Link to="/announcements" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-wine no-underline hover:underline"><ChevronLeft size={15} aria-hidden="true" /> Back to announcements</Link>
        <div className="mb-1.5 mt-3.5 flex items-center gap-3"><Tag>{item.category}</Tag><span className="text-[12.5px] text-ink-3">{item.date}</span></div>
        <h1>{item.title}</h1>
        <p className="mt-3.5 text-base leading-[1.7] text-ink-2">{item.body}</p>
      </Container>
    </section>
  );
}
