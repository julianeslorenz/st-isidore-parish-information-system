import { Check } from 'lucide-react';
import SacramentIcon from '../ui/SacramentIcon.jsx';
import FileUpload from './FileUpload.jsx';
import KeyValue from '../ui/KeyValue.jsx';
import { Card, CardBody } from '../ui/Card.jsx';
import { FormGrid, SelectField, TextField } from '../ui/Field.jsx';
import { SACRAMENTS, WIZARD_BOOKED_TIMES, WIZARD_DATES, WIZARD_TIMES } from '../../data/sacraments.js';
import { cn } from '../../utils/cn.js';

const StepHeading = ({ title, hint }) => (
  <>
    <h2>{title}</h2>
    <p className="mb-[18px] mt-1 text-ink-2">{hint}</p>
  </>
);

function Slot({ active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn('h-10 rounded-[10px] border px-3.5 font-medium disabled:cursor-not-allowed disabled:line-through disabled:opacity-45', active ? 'border-wine bg-wine text-white' : 'border-line-2 bg-white hover:border-wine-2')}
    >
      {children}
    </button>
  );
}

export function ServiceStep({ wizard, dispatch }) {
  return (
    <>
      <StepHeading title="What do you need?" hint="Choose a service. You will see what is required before you continue." />
      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        {Object.entries(SACRAMENTS).map(([name, s]) => (
          <button
            key={name}
            type="button"
            aria-pressed={wizard.service === name}
            onClick={() => dispatch({ type: 'service', value: name })}
            className={cn('flex w-full gap-3.5 rounded-[14px] border-[1.5px] p-[18px] text-left', wizard.service === name ? 'border-wine bg-wine-1' : 'border-line bg-white hover:border-wine-2')}
          >
            <SacramentIcon name={name} active={wizard.service === name} />
            <span><b className="text-[15px]">{name}</b><span className="mt-0.5 block text-[12.5px] text-ink-2">{s.description}</span></span>
          </button>
        ))}
      </div>
    </>
  );
}

export function ApplicantStep({ wizard, dispatch, detailValue }) {
  const sacrament = SACRAMENTS[wizard.service];
  const set = (key) => (e) => dispatch({ type: 'field', key, value: e.target.value });
  const f = wizard.fields;
  return (
    <>
      <StepHeading title="Applicant information" hint="Tell us who is making this request." />
      <FormGrid>
        <TextField label="First name" value={f.firstName} onChange={set('firstName')} autoComplete="given-name" />
        <TextField label="Last name" value={f.lastName} onChange={set('lastName')} autoComplete="family-name" />
        <TextField label="Email address" type="email" value={f.email} onChange={set('email')} autoComplete="email" />
        <TextField label="Mobile number" value={f.mobile} onChange={set('mobile')} autoComplete="tel" />
      </FormGrid>
      <h3 className="mb-3.5 mt-[26px]">{sacrament.detailTitle}</h3>
      <FormGrid>
        {sacrament.fields.map((field) => (
          <TextField key={`${wizard.service}-${field.key}`} label={field.label} type={field.type ?? 'text'} value={detailValue(field)} onChange={set(field.key)} />
        ))}
      </FormGrid>
    </>
  );
}

export function ScheduleStep({ wizard, dispatch }) {
  return (
    <>
      <StepHeading title="Choose a schedule" hint="Pick the date and time you prefer. The parish office will confirm it." />
      <h4 className="mb-2.5">Available dates</h4>
      <div className="flex flex-wrap gap-2">
        {WIZARD_DATES.map((d) => <Slot key={d} active={wizard.date === d} onClick={() => dispatch({ type: 'date', value: d })}>{new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</Slot>)}
      </div>
      <h4 className="mb-2.5 mt-[22px]">Time</h4>
      <div className="flex flex-wrap gap-2">
        {WIZARD_TIMES.map((t) => <Slot key={t} active={wizard.time === t} disabled={WIZARD_BOOKED_TIMES.includes(t)} onClick={() => dispatch({ type: 'time', value: t })}>{t}</Slot>)}
      </div>
      <p className="mt-2 text-[12.5px] text-ink-3">10:00 AM is already booked on this date.</p>
      <div className="mt-[22px] max-w-[360px]">
        <SelectField label="Priest preference" value={wizard.fields.priest} onChange={(e) => dispatch({ type: 'field', key: 'priest', value: e.target.value })} options={['Fr. Miguel Santos', 'Fr. Antonio Reyes', 'No preference']} />
      </div>
    </>
  );
}

export function DocumentsStep({ wizard, dispatch }) {
  const sacrament = SACRAMENTS[wizard.service];
  return (
    <>
      <StepHeading title="Supporting documents" hint="Upload clear photos or scans. PDF, JPG or PNG up to 5 MB each." />
      <div className="flex flex-col gap-3">
        {sacrament.documents.map((doc, i) => (
          <FileUpload key={doc} label={doc} file={wizard.docs[i]?.file}
            onSelect={(file) => dispatch({ type: 'setDoc', index: i, file, label: doc })}
            onRemove={() => dispatch({ type: 'setDoc', index: i, file: null })} />
        ))}
      </div>
    </>
  );
}

export function ReviewStep({ wizard, detailValue, onEdit }) {
  const sacrament = SACRAMENTS[wizard.service];
  const f = wizard.fields;
  const uploaded = Object.values(wizard.docs).filter((document) => document?.file).length;
  const sections = [
    ['Service', [['Service', wizard.service]], 1],
    ['Applicant', [['Name', `${f.firstName} ${f.lastName}`], ['Email', f.email], ['Mobile', f.mobile]], 2],
    ['Details', sacrament.fields.map((x) => [x.label, detailValue(x)]), 2],
    ['Schedule', [['Date', new Date(`${wizard.date}T12:00:00`).toLocaleDateString()], ['Time', wizard.time], ['Priest', f.priest]], 3],
    ['Documents', [['Uploaded', `${uploaded} of ${sacrament.documents.length}`], ['Files', Object.values(wizard.docs).map((document) => document.file?.name).filter(Boolean).join(', ') || 'None']], 4],
  ];
  return (
    <>
      <StepHeading title="Review your request" hint="Check everything before you submit." />
      <div className="flex flex-col gap-3.5">
        {sections.map(([title, items, step]) => (
          <Card key={title}>
            <div className="flex items-center border-b border-line px-[18px] py-3">
              <h4>{title}</h4><span className="flex-1" />
              <button type="button" onClick={() => onEdit(step)} className="text-[12.5px] font-medium text-wine hover:underline" aria-label={`Edit ${title}`}>Edit</button>
            </div>
            <CardBody className="!px-[18px] !py-3.5"><KeyValue labelWidth={130} items={items} /></CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}

export function SubmitStep({ wizard, dispatch }) {
  return (
    <>
      <StepHeading title="Ready to submit" hint={`Once submitted, the parish office will review your ${wizard.service.toLowerCase()} request.`} />
      <Card className="bg-paper">
        <CardBody>
          <div className="flex items-start gap-3">
            <SacramentIcon name={wizard.service} />
            <div><b>{wizard.service} request</b><div className="text-[12.5px] text-ink-2">{new Date(`${wizard.date}T12:00:00`).toLocaleDateString()}, {wizard.time}{wizard.fields.priest ? `, with ${wizard.fields.priest}` : ''}</div></div>
          </div>
          <label className="mt-[18px] flex items-start gap-2.5 font-normal">
            <input type="checkbox" className="mt-0.5" checked={wizard.agree} onChange={(e) => dispatch({ type: 'agree', value: e.target.checked })} />
            I confirm that the information I provided is accurate and that I will bring original documents on the day of the rite.
          </label>
        </CardBody>
      </Card>
    </>
  );
}

export function SubmittedPanel({ reference, onTrack, onHome }) {
  return (
    <Card>
      <CardBody className="px-6 py-11 text-center">
        <div className="inline-flex h-[72px] w-[72px] items-center justify-center rounded-full bg-ok-bg text-ok"><Check size={36} aria-hidden="true" /></div>
        <h2 className="mb-1.5 mt-4">Request submitted</h2>
        <p className="text-ink-2">Your reference number is <b className="tabular-nums">{reference}</b>.<br />We will review it within 3 working days and send you a message.</p>
        <div className="mt-[22px] flex flex-wrap justify-center gap-2.5">{onTrack}{onHome}</div>
      </CardBody>
    </Card>
  );
}
