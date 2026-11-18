import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { FormGrid, SelectField, TextareaField, TextField } from '../ui/Field.jsx';
import { APPOINTMENT_PRIESTS, APPOINTMENT_TIMES, APPOINTMENT_TYPES } from '../../data/appointments.js';

const KIND_FOR_TYPE = { Baptism: 'bap', Marriage: 'wed', Confirmation: 'conf', Funeral: 'mass', Other: 'out' };
const pad = (n) => String(n).padStart(2, '0');
const initialDate = () => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

/**
 * Create or reschedule an appointment. Mount conditionally so state resets on every open.
 * `onSubmit` receives a plain appointment patch; the page decides how to store it.
 */
export default function AppointmentModal({ mode = 'new', appointment, onClose, onSubmit }) {
  const resched = mode === 'reschedule';
  const [form, setForm] = useState({
    type: appointment?.type ?? 'Baptism',
    date: appointment?.start_at ? appointment.start_at.slice(0, 10) : initialDate(),
    time: appointment?.time ?? APPOINTMENT_TIMES[0],
    priest: appointment && APPOINTMENT_PRIESTS.includes(appointment.priest) ? appointment.priest : APPOINTMENT_PRIESTS[0],
    who: resched ? appointment.who : '',
    notes: '',
  });
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = () => {
    const selectedDate = new Date(`${form.date}T00:00:00`);
    if (!form.date || Number.isNaN(selectedDate.getTime())) {
      setError('Choose a valid appointment date.');
      return;
    }
    onSubmit({
      type: form.type,
      kind: KIND_FOR_TYPE[form.type],
      date: form.date,
      day,
      time: form.time,
      priest: form.priest,
      who: form.who.trim() || appointment?.who || 'Parish office booking',
      title: resched ? appointment.title : `${form.type} appointment`,
      note: form.notes.trim() || appointment?.note || 'No notes added.',
      status: resched ? 'confirmed' : 'pending',
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={resched ? 'Reschedule appointment' : 'New appointment'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>{resched ? 'Save changes' : 'Schedule appointment'}</Button></>}
    >
      <FormGrid>
        <SelectField full label="Appointment type" value={form.type} onChange={set('type')} options={APPOINTMENT_TYPES} />
        <TextField full label="With (parishioner or family)" value={form.who} onChange={set('who')} placeholder="Optional" />
        <TextField label="Date" type="date" min={initialDate()} value={form.date} onChange={set('date')} error={error} />
        <SelectField label="Time" value={form.time} onChange={set('time')} options={APPOINTMENT_TIMES} />
        <SelectField full label="Priest" value={form.priest} onChange={set('priest')} options={APPOINTMENT_PRIESTS} />
        <TextareaField full label="Notes" value={form.notes} onChange={set('notes')} placeholder="Optional" />
      </FormGrid>
    </Modal>
  );
}
