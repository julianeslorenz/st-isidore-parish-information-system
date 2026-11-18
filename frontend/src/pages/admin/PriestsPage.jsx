import { useMemo, useState } from 'react';
import { Church, Pencil, Plus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import DateTile from '../../components/ui/DateTile.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal, { ConfirmModal } from '../../components/ui/Modal.jsx';
import KeyValue from '../../components/ui/KeyValue.jsx';
import SearchBar from '../../components/ui/SearchBar.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { CheckboxField, FormGrid, Select, SelectField, TextareaField, TextField } from '../../components/ui/Field.jsx';
import { StatusBadge, Tag } from '../../components/ui/Badge.jsx';
import Toolbar from '../../components/layout/Toolbar.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import { usePageMeta } from '../../context/AdminShellContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useIsMobile } from '../../hooks/useMediaQuery.js';
import { PRIEST_ROLES } from '../../data/priests.js';
import { SACRAMENT_NAMES } from '../../data/sacraments.js';

function PriestForm({ priest, onClose, onSave }) {
  const [form, setForm] = useState({ name: priest?.name ?? '', role: priest?.role ?? 'Parochial vicar', phone: priest?.phone ?? '', email: priest?.email ?? '', availability: priest?.availability ?? '', sacraments: priest?.sacraments ?? [] });
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggle = (name) => setForm((f) => ({ ...f, sacraments: f.sacraments.includes(name) ? f.sacraments.filter((s) => s !== name) : [...f.sacraments, name] }));
  const submit = () => (form.name.trim() ? onSave({ ...form, name: form.name.trim() }) : setError('Enter the priest\u2019s full name'));

  return (
    <Modal open onClose={onClose} title={priest ? 'Edit priest' : 'Add priest'} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>{priest ? 'Save changes' : 'Add priest'}</Button></>}>
      <FormGrid>
        <TextField full label="Full name" placeholder="Fr. First Last" value={form.name} onChange={set('name')} error={error} />
        <SelectField label="Role" value={form.role} onChange={set('role')} options={PRIEST_ROLES} />
        <TextField label="Phone" value={form.phone} onChange={set('phone')} />
        <TextField full label="Email" type="email" value={form.email} onChange={set('email')} />
      </FormGrid>
      <h4 className="mb-2 mt-4">Assigned sacraments</h4>
      <div className="flex flex-wrap gap-4">
        {SACRAMENT_NAMES.map((s) => <CheckboxField key={s} className="items-center" checked={form.sacraments.includes(s)} onChange={() => toggle(s)}>{s}</CheckboxField>)}
      </div>
      <div className="mt-4"><TextareaField label="Availability" placeholder="One line per schedule" value={form.availability} onChange={set('availability')} /></div>
    </Modal>
  );
}

function PriestProfile({ priest: p, appointments, onEdit, onToggle }) {
  const mine = appointments.filter((a) => a.priest === p.name);
  return (
    <CardBody>
      <div className="flex items-center gap-3">
        <Avatar name={p.name} size={56} />
        <div><h3>{p.name}</h3><span className="text-[12.5px] text-ink-2">{p.role}</span></div>
        <span className="flex-1" /><StatusBadge status={p.status} />
      </div>
      <div className="my-4"><KeyValue labelWidth={80} items={[['Email', p.email], ['Phone', p.phone]]} /></div>
      <h4>Assigned sacraments</h4>
      <div className="mb-3.5 mt-2 flex flex-wrap gap-2">{p.sacraments.map((s) => <Tag key={s}>{s}</Tag>)}</div>
      <h4>Availability</h4>
      <p className="mb-3.5 mt-1.5 whitespace-pre-line text-[12.5px] text-ink-2">{p.availability}</p>
      <h4>Appointments</h4>
      {mine.length ? mine.slice(0, 4).map((a) => (
        <div key={a.id} className="flex items-center gap-3 py-2"><DateTile day={a.day} /><div><b>{a.title}</b><div className="text-[12.5px] text-ink-2">{a.time}</div></div></div>
      )) : <p className="mt-1.5 text-[12.5px] text-ink-2">No appointments on record.</p>}
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Button variant="secondary" onClick={onEdit}><Pencil size={16} aria-hidden="true" /> Edit</Button>
        <Button variant={p.status === 'active' ? 'danger-solid' : 'success'} onClick={onToggle}>{p.status === 'active' ? 'Deactivate' : 'Activate'}</Button>
      </div>
    </CardBody>
  );
}

export default function PriestsPage() {
  usePageMeta('Priests', 'Records');
  const toast = useToast();
  const isMobile = useIsMobile();
  const { priests, appointments, savePriest, togglePriest } = useData();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState(priests[0]?.id);
  const [dialog, setDialog] = useState(null); // 'add' | 'edit' | 'toggle' | 'sheet'

  const rows = useMemo(() => priests.filter((p) => (status === 'all' || p.status === status) && (!query.trim() || p.name.toLowerCase().includes(query.trim().toLowerCase()))), [priests, status, query]);
  const selected = priests.find((p) => p.id === selectedId);
  const close = () => setDialog(null);

  const profile = selected && <PriestProfile priest={selected} appointments={appointments} onEdit={() => setDialog('edit')} onToggle={() => setDialog('toggle')} />;
  const columns = [
    { key: 'name', header: 'Priest', first: true, render: (p) => <div className="flex items-center gap-2.5"><Avatar name={p.name} size={34} /><b>{p.name}</b></div> },
    { key: 'role', header: 'Role', render: (p) => p.role },
    { key: 'sacraments', header: 'Sacraments', className: 'text-ink-2', render: (p) => `${p.sacraments.length} assigned` },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <>
      <PageHeader title="Priests" subtitle="Manage priest profiles, assigned sacraments and availability." actions={<Button onClick={() => setDialog('add')}><Plus size={17} aria-hidden="true" /> Add priest</Button>} />
      <div className="grid grid-cols-[minmax(0,1fr)_350px] items-start gap-5 max-lg:grid-cols-1">
        <Card>
          <Toolbar>
            <SearchBar value={query} onChange={setQuery} placeholder="Search priests" />
            <Select aria-label="Status" className="w-auto" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </Toolbar>
          {rows.length
            ? <DataTable columns={columns} rows={rows} getRowKey={(p) => p.id} selectedKey={selectedId} onRowClick={(p) => { setSelectedId(p.id); if (isMobile) setDialog('sheet'); }} caption="Priests" />
            : <EmptyState icon={Church} title="No priests found" description="Try a different search or filter." action={<Button variant="secondary" onClick={() => { setQuery(''); setStatus('all'); }}>Clear filters</Button>} />}
        </Card>
        <Card className="max-md:hidden">{profile ?? <EmptyState icon={Church} title="Select a priest" description="Choose a priest to see the profile." />}</Card>
      </div>

      {dialog === 'sheet' && selected && <Modal open onClose={close} title="Priest profile">{profile}</Modal>}
      {dialog === 'add' && <PriestForm onClose={close} onSave={(p) => { savePriest(p); close(); toast('Priest saved'); }} />}
      {dialog === 'edit' && selected && <PriestForm priest={selected} onClose={close} onSave={(p) => { savePriest({ ...p, id: selected.id }); close(); toast('Priest saved'); }} />}
      <ConfirmModal
        open={dialog === 'toggle'}
        onClose={close}
        tone={selected?.status === 'active' ? 'danger' : 'success'}
        title={selected ? `${selected.status === 'active' ? 'Deactivate' : 'Activate'} ${selected.name}?` : ''}
        confirmLabel={selected?.status === 'active' ? 'Deactivate' : 'Activate'}
        onConfirm={() => { togglePriest(selected.id); close(); toast(`${selected.name} is now ${selected.status === 'active' ? 'inactive' : 'active'}`); }}
      >
        {selected?.status === 'active' ? 'This priest will no longer appear when scheduling appointments. Past records are kept.' : 'This priest will be available for scheduling again.'}
      </ConfirmModal>
    </>
  );
}
