import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../ui/Card.jsx';
import { Tag } from '../ui/Badge.jsx';
import DateTile from '../ui/DateTile.jsx';
import Container from '../ui/Container.jsx';
import { cn } from '../../utils/cn.js';

/** Titled card of label/value rows (prototype infoCard). */
export function InfoCard({ title, icon: Icon, rows }) {
  return (
    <Card>
      <CardHeader title={title} icon={Icon} />
      <CardBody className="flex flex-col gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-ink-2">{label}</span>
            <span className="flex-1" />
            <b className="text-right">{value}</b>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

/** Page title band used on every public inner page (prototype pHead). */
export function PageHero({ title, subtitle }) {
  return (
    <div className="bg-wine-1 py-[34px] max-md:py-7">
      <Container>
        <h1 className="text-[34px] max-md:text-[26px]">{title}</h1>
        <p className="mt-1.5 text-ink-2">{subtitle}</p>
      </Container>
    </div>
  );
}

/** Content section with the prototype's vertical rhythm; `alt` gives the white banded variant. */
export function Section({ alt = false, className, children }) {
  return <section className={cn('py-11', alt && 'border-y border-line bg-white', className)}><Container>{children}</Container></section>;
}

export function SectionHeading({ title, subtitle, link }) {
  return (
    <div className="flex items-end gap-3">
      <div>
        <h2 className="mb-1.5 text-[26px]">{title}</h2>
        {subtitle && <p className="mb-[18px] text-ink-2">{subtitle}</p>}
      </div>
      <span className="flex-1" />
      {link && <Link to={link.to} className="mb-[18px] text-[13px] font-medium text-wine no-underline hover:underline">{link.label}</Link>}
    </div>
  );
}

export function AnnouncementCard({ item }) {
  return (
    <Card as="article" className="relative transition-colors hover:border-wine-2">
      <CardBody>
        <div className="flex items-center gap-3">
          <Tag>{item.category}</Tag>
          <span className="flex-1" />
          <span className="text-[12.5px] text-ink-3">{item.date}</span>
        </div>
        <h3 className="mb-1.5 mt-2.5">{item.title}</h3>
        <p className="text-ink-2">{item.summary}</p>
        <Link to={`/announcements/${item.id}`} className="mt-2.5 inline-block text-[12.5px] font-medium text-wine no-underline after:absolute after:inset-0 after:content-[''] hover:underline" aria-label={`View details: ${item.title}`}>
          View details
        </Link>
      </CardBody>
    </Card>
  );
}

export function EventCard({ event, onOpen }) {
  return (
    <Card className="transition-colors hover:border-wine-2">
      <button type="button" onClick={() => onOpen(event)} className="flex w-full items-start gap-3 rounded-xl px-5 py-[18px] text-left">
        <DateTile month={event.month} day={event.day} />
        <span className="min-w-0">
          <Tag>{event.category}</Tag>
          <h4 className="mb-0.5 mt-1.5">{event.title}</h4>
          <span className="block text-[12.5px] text-ink-2">{event.time}, {event.location}</span>
          <span className="mt-1.5 block text-[12.5px] text-ink-2">{event.summary}</span>
        </span>
      </button>
    </Card>
  );
}
