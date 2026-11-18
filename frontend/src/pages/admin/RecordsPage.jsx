import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import IconButton from '../../components/ui/IconButton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal, { ConfirmModal } from '../../components/ui/Modal.jsx';
import SearchBar from '../../components/ui/SearchBar.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Toolbar from '../../components/layout/Toolbar.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { FormGrid, SelectField, TextareaField, TextField } from '../../components/ui/Field.jsx';
import { usePageMeta } from '../../context/AdminShellContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { REQUEST_TYPES } from '../../data/requests.js';
import { RECORD_DATE_FIELD, RECORD_PERSON_FIELD, SACRAMENTAL_RECORD_FIELDS } from '../../data/sacramentalRecords.js';

const dateValue = (value) => value ? String(value).slice(0, 10) : '';
const blankDetails = (type) => Object.fromEntries(SACRAMENTAL_RECORD_FIELDS[type].flatMap((section) => section.fields.map(({ key }) => [key, ''])));
const initialForm = (record) => {
  const type = record?.type || 'Baptism';
  const details = { ...blankDetails(type), ...(record?.details || {}) };
  const personField = RECORD_PERSON_FIELD[type];
  if (personField && !details[personField]) details[personField] = record?.name || '';
  const dateField = RECORD_DATE_FIELD[type];
  if (dateField && !details[dateField]) details[dateField] = dateValue(record?.date);
  return { type, details };
};

function RecordForm({ record, onClose, onSave }) {
  const [form, setForm] = useState(() => initialForm(record));
  const [error, setError] = useState('');
  const setType = (event) => setForm({ type: event.target.value, details: blankDetails(event.target.value) });
  const setField = (key) => (event) => setForm((value) => ({ ...value, details: { ...value.details, [key]: event.target.value } }));

  const submit = async () => {
    const { type, details } = form;
    const personName = type === 'Marriage'
      ? [details.groom_name, details.bride_name].filter(Boolean).join(' & ')
      : details[RECORD_PERSON_FIELD[type]];
    if (!personName?.trim()) return setError(type === 'Marriage' ? 'Enter the groom and bride names.' : 'Enter the name shown in the parish register.');
    const date = details[RECORD_DATE_FIELD[type]];
    if (!date) return setError(`Enter the ${type.toLowerCase()} date.`);

    const cleanedDetails = Object.fromEntries(Object.entries(details).map(([key, value]) => [key, value === '' ? null : value]));
    const result = await onSave({ id: record?.id, payload: {
      sacrament_type: type,
      person_name: personName.trim(),
      record_number: cleanedDetails.index_number ? String(cleanedDetails.index_number) : record?.record_number || null,
      record_date: `${date}T00:00:00`,
      details: cleanedDetails,
    } });
    if (result) onClose(); else setError('The record could not be saved. Check access and try again.');
  };

  return <Modal open onClose={onClose} size="lg" title={record ? 'Edit sacramental record' : 'Add sacramental record'} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>Save record</Button></>}>
    <FormGrid>
      <SelectField full label="Sacrament" value={form.type} onChange={setType} options={REQUEST_TYPES} disabled={Boolean(record?.id)} />
    </FormGrid>
    <div className="mt-5 space-y-6">
      {SACRAMENTAL_RECORD_FIELDS[form.type].map((section) => <section key={section.section}>
        <h4 className="mb-3 border-b border-line pb-2 text-sm font-semibold text-ink">{section.section}</h4>
        <FormGrid>
          {section.fields.map((field) => {
            const value = form.details[field.key] ?? '';
            if (field.type === 'select') return <SelectField key={field.key} full={field.full} label={field.label} value={value} onChange={setField(field.key)} options={[{ value: '', label: 'Select…' }, ...field.options]} />;
            if (field.type === 'textarea') return <TextareaField key={field.key} full={field.full} label={field.label} value={value} onChange={setField(field.key)} rows={2} />;
            return <TextField key={field.key} full={field.full} label={field.label} type={field.type || 'text'} min={field.type === 'number' ? '0' : undefined} value={value} onChange={setField(field.key)} />;
          })}
        </FormGrid>
      </section>)}
    </div>
    {error && <p className="mt-4 text-[13px] text-bad" role="alert">{error}</p>}
  </Modal>;
}

const registerReference = (record) => {
  const d = record.details || {};
  const parts = [['Index', d.index_number], ['Book', d.book_number], ['Page', d.page_number]].filter(([, value]) => value !== null && value !== undefined && value !== '');
  return parts.length ? parts.map(([label, value]) => `${label} ${value}`).join(' · ') : record.record_number || '—';
};

export default function RecordsPage() {
  usePageMeta('Sacramental records', 'Records');
  const toast = useToast();
  const { records, saveRecord, deleteRecord } = useData();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All sacraments');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const rows = useMemo(() => records.filter((record) => (type === 'All sacraments' || record.type === type)
    && (!query.trim() || `${record.name} ${registerReference(record)}`.toLowerCase().includes(query.trim().toLowerCase()))), [records, type, query]);
  const columns = [
    { key: 'type', header: 'Sacrament', first: true, render: (r) => r.type },
    { key: 'name', header: 'Name', render: (r) => r.name },
    { key: 'reference', header: 'Register reference', className: 'text-ink-2', render: registerReference },
    { key: 'date', header: 'Date', className: 'text-ink-2', render: (r) => r.date ? new Date(r.date).toLocaleDateString() : '—' },
    { key: 'actions', header: 'Actions', align: 'right', actions: true, render: (r) => <><IconButton label={`Edit ${r.name}`} size="sm" onClick={() => setEditing(r)}><Pencil size={16} /></IconButton><IconButton label={`Delete ${r.name}`} size="sm" onClick={() => setDeleting(r)}><Trash2 size={16} /></IconButton></> },
  ];
  const confirmDelete = async () => {
    const result = await deleteRecord(deleting.id);
    if (result !== null) { toast('Record deleted'); setDeleting(null); }
  };

  return <>
    <PageHeader title="Sacramental records" subtitle="Search and maintain the parish baptism, marriage, confirmation and funeral registers." actions={<Button onClick={() => setEditing({})}><Plus size={17} aria-hidden="true" /> Add record</Button>} />
    <Card>
      <Toolbar>
        <SearchBar value={query} onChange={setQuery} placeholder="Search name or register reference" />
        <SelectField label="Sacrament" value={type} onChange={(event) => setType(event.target.value)} options={['All sacraments', ...REQUEST_TYPES]} />
      </Toolbar>
      {rows.length ? <DataTable columns={columns} rows={rows} getRowKey={(row) => row.id} caption="Sacramental records" /> : <EmptyState icon={Search} title="No records found" description="Try another search or add a register entry." action={<Button variant="secondary" onClick={() => { setQuery(''); setType('All sacraments'); }}>Clear filters</Button>} />}
    </Card>
    {editing && <RecordForm record={editing.id ? editing : null} onClose={() => setEditing(null)} onSave={saveRecord} />}
    {deleting && <ConfirmModal open onClose={() => setDeleting(null)} tone="danger" title="Delete this sacramental record?" description={`This will permanently remove the ${deleting.type.toLowerCase()} entry for ${deleting.name}.`} cancelLabel="Keep record" confirmLabel="Delete record" onConfirm={confirmDelete} />}
  </>;
}
