import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { FormGrid, SelectField, TextField } from '../ui/Field.jsx';
import { EVENT_KINDS, EVENT_START_TIMES } from '../../data/events.js';

const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

export default function EventModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', kind: 'mass', date: today(), time: EVENT_START_TIMES[0], location: 'St. Isidore Parish Church' });
  const [errors, setErrors] = useState({});
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Enter an event title';
    if (!form.date || Number.isNaN(new Date(`${form.date}T00:00:00`).getTime())) next.date = 'Choose a valid date';
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({ title: form.title.trim(), kind: form.kind, category: form.kind === 'out' ? 'Community' : form.kind === 'feast' ? 'Special celebrations' : 'Religious activities', date: form.date, day: Number(form.date.split('-')[2]), time: form.time, location: form.location });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Add event"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>Add event</Button></>}
    >
      <FormGrid>
        <TextField full label="Event title" value={form.title} onChange={set('title')} placeholder="For example, Rosary procession" error={errors.title} />
        <SelectField label="Type" value={form.kind} onChange={set('kind')} options={Object.entries(EVENT_KINDS).map(([value, { label }]) => ({ value, label }))} />
        <TextField label="Date" type="date" min={today()} value={form.date} onChange={set('date')} error={errors.date} />
        <SelectField label="Start time" value={form.time} onChange={set('time')} options={EVENT_START_TIMES} />
        <TextField label="Location" value={form.location} onChange={set('location')} />
      </FormGrid>
    </Modal>
  );
}
