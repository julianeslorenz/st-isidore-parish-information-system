import { Church, Clock } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { InfoCard, PageHero, Section } from '../../components/common/PublicCards.jsx';
import { OFFICE_HOURS, PARISH } from '../../data/parish.js';

export default function AboutPage() {
  return (
    <>
      <PageHero title="About the parish" subtitle="Who we are and how to reach the parish office." />
      <Section>
        <div className="grid grid-cols-[minmax(0,1fr)_350px] items-start gap-5 max-lg:grid-cols-1">
          <div className="flex flex-col gap-5">
            <Card><CardBody>
              <h3>Welcome</h3>
              <p className="mt-2 text-ink-2">St. Isidore Parish is a Catholic community that celebrates the sacraments, prays together and serves its neighbors. This portal lets parishioners request sacraments and follow their requests, and keeps everyone informed about parish life.</p>
            </CardBody></Card>
            <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
              <Card><CardBody><h4>Our mission</h4><p className="mt-1.5 text-[12.5px] text-ink-2">To welcome everyone, hand on the faith and serve the community with joy.</p></CardBody></Card>
              <Card><CardBody><h4>Our vision</h4><p className="mt-1.5 text-[12.5px] text-ink-2">A parish family where every person is known, cared for and invited to take part.</p></CardBody></Card>
            </div>
            <Card><CardBody><h4>Parish history</h4><p className="mt-1.5 text-[12.5px] text-ink-2">The parish office will provide the official parish history for this section.</p></CardBody></Card>
          </div>
          <div className="flex flex-col gap-5">
            <InfoCard title="Parish office" icon={Church} rows={[['Address', PARISH.address], ['Phone', PARISH.phone], ['Email', PARISH.email]]} />
            <InfoCard title="Office hours" icon={Clock} rows={OFFICE_HOURS} />
          </div>
        </div>
      </Section>
    </>
  );
}
