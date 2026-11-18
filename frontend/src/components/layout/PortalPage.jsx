import Container from '../ui/Container.jsx';
import { cn } from '../../utils/cn.js';

/** Content column for parishioner pages. `hero` renders the tinted welcome band above it. */
export default function PortalPage({ hero, className, children }) {
  return (
    <>
      {hero}
      <Container className={cn(!hero && 'pt-7', 'pb-6', className)}>{children}</Container>
    </>
  );
}

export function PortalHero({ title, subtitle, action }) {
  return (
    <div className="bg-portal-hero pb-[26px] pt-7">
      <Container className="flex flex-wrap items-center gap-4">
        <div>
          <h1 className="max-md:text-2xl">{title}</h1>
          <p className="mt-1 text-ink-2">{subtitle}</p>
        </div>
        <span className="flex-1" />
        {action}
      </Container>
    </div>
  );
}
