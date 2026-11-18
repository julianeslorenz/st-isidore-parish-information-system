import { useState } from 'react';
import { Church, Clock, MapPin } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { TextField, TextareaField } from '../../components/ui/Field.jsx';
import { InfoCard, PageHero, Section } from '../../components/common/PublicCards.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { OFFICE_HOURS, PARISH } from '../../data/parish.js';
import { isEmail } from '../../utils/format.js';

export default function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const mapQuery = encodeURIComponent(`${PARISH.name} Church, ${PARISH.address}`);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (event) => {
    event.preventDefault();
    const found = {};
    if (!form.name.trim()) found.name = 'Enter your name';
    if (!isEmail(form.email)) found.email = 'Enter a valid email address';
    if (!form.message.trim()) found.message = 'Write a short message';
    setErrors(found);
    if (Object.keys(found).length) return;
    toast('Your inquiry was sent. We usually reply within 3 working days.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <>
      <PageHero title="Contact the parish office" subtitle="We usually reply within 3 working days." />
      <Section>
        <div className="grid grid-cols-[minmax(0,1fr)_350px] items-start gap-5 max-lg:grid-cols-1">
          <div className="flex flex-col gap-5">
            <div className="overflow-hidden rounded-xl border border-line bg-white">
              <iframe
                title={`Map showing ${PARISH.name}, ${PARISH.address}`}
                src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
                className="h-[300px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="flex items-center gap-2 border-t border-line px-4 py-3 text-sm">
                <MapPin size={17} className="flex-none text-wine" aria-hidden="true" />
                <span className="flex-1 text-ink-2">{PARISH.address}</span>
                <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer" className="font-medium text-wine hover:underline">Open map</a>
              </div>
            </div>
            <Card>
              <CardHeader title="Send an inquiry" />
              <CardBody>
                <form onSubmit={submit} noValidate className="flex flex-col gap-4">
                  <TextField label="Your name" value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" />
                  <TextField label="Email address" type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
                  <TextareaField label="Message" placeholder="How can the parish office help?" value={form.message} onChange={set('message')} error={errors.message} />
                  <div><Button type="submit">Send inquiry</Button></div>
                </form>
              </CardBody>
            </Card>
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
