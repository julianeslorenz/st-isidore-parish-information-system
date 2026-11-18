import { useMemo, useState } from 'react';
import { Award, Check, Eye, FileText, Pencil, Plus, Printer } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import IconButton from '../../components/ui/IconButton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal, { ConfirmModal } from '../../components/ui/Modal.jsx';
import Note from '../../components/ui/Note.jsx';
import SearchBar from '../../components/ui/SearchBar.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Timeline from '../../components/ui/Timeline.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Select, SelectField, TextareaField, TextField } from '../../components/ui/Field.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import Toolbar from '../../components/layout/Toolbar.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import CertificatePreview from '../../components/common/CertificatePreview.jsx';
import { usePageMeta } from '../../context/AdminShellContext.jsx';
import { can, useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { CERTIFICATE_FORM_FIELDS, CERT_NEXT, CERT_STATUS_FILTERS, CERT_TYPES } from '../../data/certificates.js';
import { STATUS_LABELS } from '../../data/statuses.js';
import { openPdf } from '../../api/client.js';

const LIVE = ['processing', 'signature']; // still being prepared, so it can be printed or cancelled
const STATUS_BY_LABEL = Object.fromEntries(Object.entries(STATUS_LABELS).map(([key, label]) => [label, key]));
const NEXT_HINT = { 'certificate.sign': 'Only a priest can sign a certificate', 'certificate.print': 'Only office staff can send a certificate for signature', 'certificate.release': 'Only office staff can release a certificate' };

function RevokeModal({ onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  return (
    <Modal open onClose={onClose} title="Revoke this certificate" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger-solid" onClick={() => (reason.trim() ? onConfirm(reason.trim()) : setError('A reason is required to revoke.'))}>Revoke</Button></>}>
      <TextareaField label="Reason (required)" placeholder="For example, correction of record" value={reason} onChange={(e) => setReason(e.target.value)} error={error} />
    </Modal>
  );
}

const initialCertificateDetails = () => ({
  date_issued: new Date().toISOString().slice(0, 10),
  church: 'St. Isidore the Farmer Parish',
});

function PrepareModal({ certificate, onClose, onCreate, onUpdate }) {
  const [name, setName] = useState(certificate?.name || '');
  const [type, setType] = useState(certificate?.type || 'Baptism');
  const [details, setDetails] = useState(() => ({ ...initialCertificateDetails(), ...(certificate?.details || {}) }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fields = CERTIFICATE_FORM_FIELDS[type].flatMap((section) => section.fields);
  const setDetail = (key) => (event) => setDetails((current) => ({ ...current, [key]: event.target.value }));
  const create = async () => {
    const missing = fields.filter((field) => field.required && !String(details[field.key] || '').trim()).map((field) => field.label);
    if (type !== 'Marriage' && !name.trim()) missing.unshift(type === 'Funeral' ? 'Name of deceased' : 'Full name');
    if (missing.length) { setError(`Complete the required fields: ${missing.join(', ')}.`); return; }
    const certificateName = type === 'Marriage' ? `${details.groom_name.trim()} and ${details.bride_name.trim()}` : name.trim();
    setSaving(true);
    const result = certificate ? await onUpdate(certificate.id, certificateName, details) : await onCreate(certificateName, type, details);
    setSaving(false);
    if (!result) { setError('The certificate details could not be saved. Check the message and try again.'); return; }
    onClose();
  };
  return (
    <Modal open onClose={onClose} size="lg" title={certificate ? `Edit ${certificate.type} certificate` : 'Prepare certificate'} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={saving} onClick={create}>{saving ? 'Saving' : certificate ? 'Save details' : 'Create record'}</Button></>}>
      <div className="flex flex-col gap-4">
        {error && <Note tone="danger" role="alert">{error}</Note>}
        <Note>Enter the details from the parish register. The report copy includes the scanned form; the text-only copy is for the parish's preprinted paper.</Note>
        <FormGrid>
          <SelectField label="Certificate type" value={type} disabled={Boolean(certificate)} onChange={(event) => { setType(event.target.value); setDetails(initialCertificateDetails()); setError(''); }} options={CERT_TYPES} />
          {type !== 'Marriage' && <TextField label={type === 'Funeral' ? 'Name of deceased' : 'Full name'} value={name} onChange={(event) => setName(event.target.value)} required autoComplete="off" />}
        </FormGrid>
        {CERTIFICATE_FORM_FIELDS[type].map((section) => (
          <section key={section.section}>
            <h4 className="mb-2 border-b border-line pb-1.5">{section.section}</h4>
            <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
              {section.fields.map((field) => field.type === 'textarea'
                ? <TextareaField key={field.key} label={field.label} full={field.full} rows={2} value={details[field.key] || ''} onChange={setDetail(field.key)} required={field.required || undefined} />
                : <TextField key={field.key} label={field.label} full={field.full} type={field.type || 'text'} value={details[field.key] || ''} onChange={setDetail(field.key)} required={field.required || undefined} />)}
            </div>
          </section>
        ))}
      </div>
    </Modal>
  );
}

export default function CertificatesPage() {
  usePageMeta('Certificates', 'Records');
  const { admin } = useAuth();
  const toast = useToast();
  const { certificates, advanceCertificate, cancelCertificate, revokeCertificate, addCertificate, updateCertificateDetails } = useData();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All types');
  const [statusLabel, setStatusLabel] = useState('All statuses');
  const [viewing, setViewing] = useState(null); // certificate number
  const [dialog, setDialog] = useState(null); // { kind, number }

  const statusKey = STATUS_BY_LABEL[statusLabel];
  const rows = useMemo(() => certificates.filter((c) => {
    const q = query.trim().toLowerCase();
    return (!q || `${c.number}${c.name}`.toLowerCase().includes(q)) && (type === 'All types' || c.type === type) && (!statusKey || c.status === statusKey);
  }), [certificates, query, type, statusKey]);

  const count = (s) => certificates.filter((c) => c.status === s).length;
  const viewed = certificates.find((c) => c.number === viewing);
  const target = certificates.find((c) => c.number === dialog?.number);
  const close = () => setDialog(null);

  const advance = (c) => {
    const next = CERT_NEXT[c.status];
    if (!next) return;
    if (c.status === 'ready') { setDialog({ kind: 'release', number: c.number }); return; }
    advanceCertificate(c.number, admin.name);
    toast(`${c.number}: ${STATUS_LABELS[next.to]}`);
  };

  const print = async (c, background = true) => {
    if (!LIVE.includes(c.status)) { toast('Only certificates in preparation can be printed'); return; }
    try {
      toast(background ? 'Opening report copy' : 'Opening text-only print copy', { loading: true });
      await openPdf(`/certificates/${c.id}/pdf?background=${background}`);
    } catch (error) {
      toast(error.message || 'The certificate PDF could not be opened.');
    }
  };

  const nextButton = (c, size = 'sm', variant = 'secondary') => {
    const next = CERT_NEXT[c.status];
    if (!next) return null;
    const allowed = can(admin, next.permission);
    return <Button size={size} variant={variant} disabled={!allowed} title={allowed ? undefined : NEXT_HINT[next.permission]} onClick={() => advance(c)}>{next.label}</Button>;
  };

  const columns = [
    { key: 'number', header: 'Certificate no.', first: true, className: 'font-medium tabular-nums', render: (c) => c.number },
    { key: 'name', header: 'Parishioner', render: (c) => <b>{c.name}</b> },
    { key: 'type', header: 'Type', render: (c) => c.type },
    { key: 'date', header: 'Date', className: 'tabular-nums text-ink-2', render: (c) => c.date },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    { key: 'actions', header: 'Actions', align: 'right', actions: true, render: (c) => (
      <>
        {nextButton(c)}
        <IconButton size="sm" label={`View and manage ${c.number}`} onClick={() => setViewing(c.number)}><Eye size={17} /></IconButton>
        <IconButton size="sm" label={`Open report PDF with background for ${c.number}`} disabled={!LIVE.includes(c.status) || !can(admin, 'certificate.print')} onClick={() => print(c, true)}><Printer size={17} /></IconButton>
      </>
    ) },
  ];

  const stats = [['processing', 'Processing', FileText], ['signature', 'Awaiting signature', Pencil], ['ready', 'Ready for release', Check], ['released', 'Released', Award]];

  return (
    <>
      <PageHeader
        title="Certificates"
        subtitle="Prepare, print, sign and release. Official certificates are printed on parish paper, dry-sealed and signed by the parish priest."
        actions={can(admin, 'certificate.prepare') && <Button onClick={() => setDialog({ kind: 'prepare' })}><Plus size={17} aria-hidden="true" /> Prepare certificate</Button>}
      />
      <div className="mb-5 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:gap-3">
        {stats.map(([key, label, icon]) => (
          <StatCard key={key} icon={icon} value={count(key)} label={label} active={statusKey === key} onClick={() => setStatusLabel(STATUS_LABELS[key])} />
        ))}
      </div>

      <Card>
        <Toolbar>
          <SearchBar value={query} onChange={setQuery} placeholder="Search certificate number or name" />
          <Select aria-label="Certificate type" className="w-auto" value={type} onChange={(e) => setType(e.target.value)} options={['All types', ...CERT_TYPES]} />
          <Select aria-label="Status" className="w-auto" value={statusLabel} onChange={(e) => setStatusLabel(e.target.value)} options={CERT_STATUS_FILTERS} />
        </Toolbar>
        {rows.length ? (
          <>
            <DataTable columns={columns} rows={rows} getRowKey={(c) => c.number} caption="Certificates" />
            <div className="border-t border-line px-4 py-3 text-[13px] text-ink-2">Showing {rows.length} of {certificates.length} certificates</div>
          </>
        ) : (
          <EmptyState icon={Award} title="No certificates match" description="Try a different search or status." action={<Button variant="secondary" onClick={() => { setQuery(''); setType('All types'); setStatusLabel('All statuses'); }}>Clear filters</Button>} />
        )}
      </Card>

      {viewed && (
        <Modal
          open
          size="lg"
          onClose={() => setViewing(null)}
          title={`Certificate ${viewed.number}`}
          footer={(
            <>
              {LIVE.includes(viewed.status) && can(admin, 'certificate.prepare') && <Button variant="secondary" onClick={() => { setViewing(null); setDialog({ kind: 'edit-details', number: viewed.number }); }}><Pencil size={16} aria-hidden="true" /> Edit details</Button>}
              {LIVE.includes(viewed.status) && can(admin, 'certificate.prepare') && <Button variant="ghost" onClick={() => setDialog({ kind: 'cancel', number: viewed.number })}>Cancel</Button>}
              {viewed.status === 'released' && can(admin, 'certificate.revoke') && <Button variant="danger-solid" onClick={() => setDialog({ kind: 'revoke', number: viewed.number })}>Revoke</Button>}
              {LIVE.includes(viewed.status) && can(admin, 'certificate.print') && <>
                <Button variant="secondary" onClick={() => print(viewed, false)}><Printer size={16} aria-hidden="true" /> Text only</Button>
                <Button variant="secondary" onClick={() => print(viewed, true)}><FileText size={16} aria-hidden="true" /> Report copy</Button>
              </>}
              {nextButton(viewed, 'md', 'primary')}
            </>
          )}
        >
          <div className="mb-2.5"><StatusBadge status={viewed.status} /></div>
          <Note className="mb-3">Preview only. The official certificate is printed on parish paper, signed by the parish priest and sealed by the parish office.</Note>
          <CertificatePreview type={viewed.type} name={viewed.name} number={viewed.number} date={viewed.date} />
          <h4 className="mb-2 mt-[18px]">History</h4>
          <Timeline items={viewed.history.map((h) => ({ state: 'done', content: h.text, meta: h.date }))} />
        </Modal>
      )}

      <ConfirmModal open={dialog?.kind === 'release'} onClose={close} cancelLabel="Not yet" confirmLabel="Mark as released" title="Release this certificate?"
        onConfirm={() => { advanceCertificate(target.number, admin.name); toast(`${target.number}: ${STATUS_LABELS.released}`); close(); }}>
        {target && <p>Confirm that <b>{target.name}</b> or an authorized representative presented a valid ID and received the signed, sealed certificate.</p>}
      </ConfirmModal>
      <ConfirmModal open={dialog?.kind === 'cancel'} onClose={close} tone="danger" cancelLabel="Keep" confirmLabel="Cancel certificate" title="Cancel this certificate?"
        onConfirm={() => { cancelCertificate(target.number, admin.name); close(); toast('Certificate cancelled'); }}>
        The preparation will be stopped and the parishioner will see it as cancelled.
      </ConfirmModal>
      {dialog?.kind === 'revoke' && <RevokeModal onClose={close} onConfirm={(reason) => { revokeCertificate(dialog.number, reason); close(); toast('Certificate revoked'); }} />}
      {dialog?.kind === 'prepare' && <PrepareModal onClose={close} onCreate={async (name, t, details) => { const result = await addCertificate(name, t, details); if (result) toast('Certificate record created, status: Processing'); return result; }} />}
      {dialog?.kind === 'edit-details' && target && <PrepareModal certificate={target} onClose={close} onUpdate={async (id, name, details) => { const result = await updateCertificateDetails(id, name, details); if (result) toast('Certificate details saved'); return result; }} />}
    </>
  );
}
