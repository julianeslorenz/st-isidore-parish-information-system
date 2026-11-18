import { Award } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Note from '../../components/ui/Note.jsx';
import SacramentIcon from '../../components/ui/SacramentIcon.jsx';
import { PageHero, Section } from '../../components/common/PublicCards.jsx';
import { useRequestSacrament } from '../../hooks/useRequestSacrament.jsx';
import { SACRAMENTS } from '../../data/sacraments.js';

export default function SacramentsPage() {
  const { requestSacrament, dialog, isSignedIn } = useRequestSacrament();
  return (
    <>
      <PageHero title="Sacraments and services" subtitle="Information for parishioners and visitors. Sample requirements; the parish office has the final list." />
      <Section>
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          {Object.entries(SACRAMENTS).map(([name, s]) => (
            <Card key={name}>
              <CardBody className="flex flex-col gap-3.5">
                <div className="flex items-center gap-3"><SacramentIcon name={name} /><h3>{name}</h3></div>
                <p className="text-ink-2">{s.description}</p>
                <div>
                  <h4>Requirements</h4>
                  <ul className="mb-0 mt-1.5 list-disc pl-5 leading-[1.7]">{s.documents.map((d) => <li key={d}>{d}</li>)}</ul>
                </div>
                <div>
                  <h4>General process</h4>
                  <ol className="mb-0 mt-1.5 list-decimal pl-5 leading-[1.7]">
                    {['Submit a request online', 'Parish office reviews your documents', ...s.process].map((x) => <li key={x}>{x}</li>)}
                  </ol>
                </div>
                <Note><b>Reminder:</b> {s.reminder}</Note>
                <div><Button onClick={() => requestSacrament(name)}>{isSignedIn ? 'Request this sacrament' : 'Login to request'}</Button></div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card className="mt-5">
          <CardBody className="flex flex-wrap items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-1 text-gold-d"><Award size={22} aria-hidden="true" /></div>
            <div className="min-w-[220px] flex-1">
              <b>About certificates</b>
              <div className="text-[12.5px] text-ink-2">Official certificates are printed on parish paper, signed by the parish priest and released by the parish office. They are not downloadable.</div>
            </div>
          </CardBody>
        </Card>
      </Section>
      {dialog}
    </>
  );
}
