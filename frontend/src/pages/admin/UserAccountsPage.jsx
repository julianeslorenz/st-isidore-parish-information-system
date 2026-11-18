import { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Users } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import IconButton from '../../components/ui/IconButton.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import KeyValue from '../../components/ui/KeyValue.jsx';
import Modal, { ConfirmModal } from '../../components/ui/Modal.jsx';
import SearchBar from '../../components/ui/SearchBar.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { FormGrid, Select, SelectField, TextField } from '../../components/ui/Field.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import Toolbar from '../../components/layout/Toolbar.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import { usePageMeta } from '../../context/AdminShellContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { ROLES, ROLE_DESCRIPTIONS } from '../../data/users.js';
import { isEmail } from '../../utils/format.js';

function UserForm({ user, onClose, onSave }) {
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', role: user?.role ?? 'Parish Staff', password: '' });
  const [errors, setErrors] = useState({});
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const submit = () => {
    const found = {};
    if (!form.name.trim()) found.name = 'Enter the full name';
    if (!isEmail(form.email)) found.email = 'Enter a valid email address';
    if (!user && form.password.length < 12) found.password = 'Use a temporary password of at least 12 characters';
    setErrors(found);
    if (!Object.keys(found).length) onSave({ ...form, name: form.name.trim(), email: form.email.trim() });
  };
  return (
    <Modal open onClose={onClose} title={user ? 'Edit user' : 'Add user'} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>{user ? 'Save changes' : 'Add user'}</Button></>}>
      <FormGrid>
        <TextField full label="Full name" value={form.name} onChange={set('name')} error={errors.name} />
        <TextField full label="Email address" type="email" value={form.email} onChange={set('email')} error={errors.email} />
        <SelectField label="Role" value={form.role} onChange={set('role')} options={ROLES} />
        {!user && <TextField full label="Temporary password" type="password" value={form.password} onChange={set('password')} error={errors.password} autoComplete="new-password" />}
      </FormGrid>
      {!user && <p className="mt-2.5 text-[12.5px] text-ink-2">Share this temporary password securely and ask the new staff member to change it after signing in.</p>}
    </Modal>
  );
}

export default function UserAccountsPage() {
  usePageMeta('User accounts', 'Communication');
  const { admin } = useAuth();
  const toast = useToast();
  const { users, saveUser, toggleUser } = useData();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All roles');
  const [status, setStatus] = useState('all');
  const [dialog, setDialog] = useState(null); // { kind, id? }

  const rows = useMemo(() => users.filter((u) => (
    (role === 'All roles' || u.role === role) && (status === 'all' || u.status === status)
    && (!query.trim() || `${u.name}${u.email}`.toLowerCase().includes(query.trim().toLowerCase()))
  )), [users, role, status, query]);

  const target = users.find((u) => u.id === dialog?.id);
  const close = () => setDialog(null);
  const isSelf = (u) => u?.id === admin.id;

  const columns = [
    { key: 'user', header: 'User', first: true, render: (u) => <div className="flex items-center gap-2.5"><Avatar name={u.name} size={34} /><div><b>{u.name}</b><div className="text-[12.5px] text-ink-2">{u.email}</div></div></div> },
    { key: 'role', header: 'Role', render: (u) => u.role },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} /> },
    { key: 'last', header: 'Last login', className: 'text-ink-2', render: (u) => u.lastLogin },
    { key: 'created', header: 'Created', className: 'text-ink-2', render: (u) => u.created },
    { key: 'actions', header: 'Actions', align: 'right', actions: true, render: (u) => (
      <>
        <IconButton size="sm" label={`View ${u.name}`} onClick={() => setDialog({ kind: 'view', id: u.id })}><Eye size={17} /></IconButton>
        <IconButton size="sm" label={`Edit ${u.name}`} onClick={() => setDialog({ kind: 'form', id: u.id })}><Pencil size={17} /></IconButton>
        <Button variant="ghost" size="sm" onClick={() => setDialog({ kind: 'toggle', id: u.id })}>{u.status === 'active' ? 'Deactivate' : 'Activate'}</Button>
      </>
    ) },
  ];

  return (
    <>
      <PageHeader title="User accounts" subtitle="Staff and priest accounts for the administration portal. Parishioner accounts are managed under Parishioners." actions={<Button onClick={() => setDialog({ kind: 'form' })}><Plus size={17} aria-hidden="true" /> Add user</Button>} />
      <Card>
        <Toolbar>
          <SearchBar value={query} onChange={setQuery} placeholder="Search name or email" />
          <Select aria-label="Role" className="w-auto" value={role} onChange={(e) => setRole(e.target.value)} options={['All roles', ...ROLES]} />
          <Select aria-label="Status" className="w-auto" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        </Toolbar>
        {rows.length
          ? <DataTable columns={columns} rows={rows} getRowKey={(u) => u.id} caption="User accounts" />
          : <EmptyState icon={Users} title="No accounts found" description="Try a different search or filter." action={<Button variant="secondary" onClick={() => { setQuery(''); setRole('All roles'); setStatus('all'); }}>Clear filters</Button>} />}
      </Card>

      <Card className="mt-5">
        <CardHeader title="What each role can do" />
        <dl className="m-0 divide-y divide-line">
          {ROLE_DESCRIPTIONS.map(([name, text]) => (
            <div key={name} className="flex gap-4 px-5 py-3 max-sm:flex-col max-sm:gap-0.5"><dt className="w-[160px] flex-none font-semibold">{name}</dt><dd className="m-0 text-ink-2">{text}</dd></div>
          ))}
        </dl>
      </Card>

      {dialog?.kind === 'view' && target && (
        <Modal open onClose={close} title="User account" footer={<><Button variant="secondary" onClick={() => { close(); toast('Reset link sent'); }}>Reset password</Button><Button onClick={() => setDialog({ kind: 'form', id: target.id })}>Edit</Button></>}>
          <div className="mb-3.5 flex items-center gap-3"><Avatar name={target.name} size={52} /><div><h3>{target.name}</h3><StatusBadge status={target.status} /></div></div>
          <KeyValue labelWidth={100} items={[['Email', target.email], ['Role', target.role], ['Last login', target.lastLogin], ['Created', target.created]]} />
        </Modal>
      )}
      {dialog?.kind === 'form' && <UserForm user={target} onClose={close} onSave={(u) => { saveUser(target ? { ...u, id: target.id } : u); close(); toast('User saved'); }} />}
      {dialog?.kind === 'toggle' && target && (isSelf(target) && target.status === 'active' ? (
        <Modal open onClose={close} title="You cannot deactivate yourself" footer={<Button onClick={close}>OK</Button>}>Ask another administrator to deactivate your account.</Modal>
      ) : (
        <ConfirmModal
          open
          onClose={close}
          tone={target.status === 'active' ? 'danger' : 'success'}
          title={`${target.status === 'active' ? 'Deactivate' : 'Activate'} ${target.name}?`}
          confirmLabel={target.status === 'active' ? 'Deactivate' : 'Activate'}
          onConfirm={() => { toggleUser(target.id); close(); toast(`${target.name} is now ${target.status === 'active' ? 'inactive' : 'active'}`); }}
        >
          {target.status === 'active' ? 'This person will not be able to sign in. Their records are kept.' : 'This person will be able to sign in again.'}
        </ConfirmModal>
      ))}
    </>
  );
}
