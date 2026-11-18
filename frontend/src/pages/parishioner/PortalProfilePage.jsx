import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import PortalPage from '../../components/layout/PortalPage.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { FormGrid, SelectField, TextField } from '../../components/ui/Field.jsx';
import ChangePasswordModal from '../../components/modals/ChangePasswordModal.jsx';
import DeleteAccountModal from '../../components/modals/DeleteAccountModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Note from '../../components/ui/Note.jsx';

const fromAccount = (account) => ({
  first: account.name.split(' ')[0] || '', last: account.name.split(' ').slice(1).join(' '),
  birth: account.profile?.birth || '', civil: account.profile?.civil || 'Single',
  email: account.email, mobile: account.contact_number || '',
  street: account.profile?.street || '', barangay: account.barangay || '', zone: account.profile?.zone || '',
});

export default function PortalProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { parishioner, updateProfile } = useAuth();
  const [saved, setSaved] = useState(() => fromAccount(parishioner));
  const [form, setForm] = useState(() => fromAccount(parishioner));
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { const profile = fromAccount(parishioner); setSaved(profile); setForm(profile); }, [parishioner]);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const ro = !editing;

  const cancel = () => { setForm(saved); setEditing(false); };
  const save = async () => {
    setError('');
    const result = await updateProfile({ name: `${form.first} ${form.last}`.trim(), email: form.email, contact_number: form.mobile, barangay: form.barangay, profile: { birth: form.birth, civil: form.civil, street: form.street, zone: form.zone } });
    if (!result.ok) { setError(result.error); return; }
    setEditing(false); toast('Profile saved');
  };

  return (
    <PortalPage>
      <PageHeader
        title={`${saved.first} ${saved.last}`}
        subtitle={`Member since ${new Date(parishioner.created_at).getFullYear()}`}
        avatar={<Avatar name={parishioner.name} size={64} />}
        actions={editing
          ? <><Button variant="ghost" onClick={cancel}>Cancel</Button><Button onClick={save}>Save changes</Button></>
          : <Button variant="secondary" onClick={() => setEditing(true)}><Pencil size={16} aria-hidden="true" /> Edit profile</Button>}
      />
      {error && <Note tone="danger" role="alert" className="mb-4">{error}</Note>}
      <div className="flex flex-col gap-5">
        <Card><CardHeader title="Personal information" /><CardBody>
          <FormGrid>
            <TextField label="First name" value={form.first} onChange={set('first')} readOnly={ro} />
            <TextField label="Last name" value={form.last} onChange={set('last')} readOnly={ro} />
            <TextField label="Date of birth" type="date" value={form.birth} onChange={set('birth')} readOnly={ro} />
            <SelectField label="Civil status" value={form.civil} onChange={set('civil')} options={['Single', 'Married', 'Widowed']} disabled={ro} />
          </FormGrid>
        </CardBody></Card>
        <Card><CardHeader title="Contact information" /><CardBody>
          <FormGrid>
            <TextField label="Email address" type="email" value={form.email} onChange={set('email')} readOnly={ro} />
            <TextField label="Mobile number" value={form.mobile} onChange={set('mobile')} readOnly={ro} />
          </FormGrid>
        </CardBody></Card>
        <Card><CardHeader title="Address" /><CardBody>
          <FormGrid>
            <TextField full label="Street and house number" value={form.street} onChange={set('street')} readOnly={ro} />
            <TextField label="Barangay" value={form.barangay} onChange={set('barangay')} readOnly={ro} />
            <TextField label="Parish zone" value={form.zone} onChange={set('zone')} readOnly={ro} />
          </FormGrid>
        </CardBody></Card>
        <Card><CardHeader title="Account security" /><CardBody className="flex flex-col !py-2">
          <div className="flex items-center gap-3 py-4"><div><b>Password</b><div className="text-[12.5px] text-ink-2">Last changed 3 months ago</div></div><span className="flex-1" /><Button variant="secondary" size="sm" onClick={() => setChangingPassword(true)}>Change password</Button></div>
          <div className="flex items-center border-t border-line py-4 text-[12.5px] text-ink-2">Password changes take effect the next time you sign in on another device.</div>
        </CardBody></Card>
        <Card><CardHeader title="Delete account" /><CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="m-0 flex-1 text-sm text-ink-2">Remove your sign-in and personal profile. Parish request and appointment history is retained for parish records.</p>
          <Button variant="danger" onClick={() => setDeletingAccount(true)}><Trash2 size={16} aria-hidden="true" /> Delete my account</Button>
        </CardBody></Card>
      </div>
      {changingPassword && <ChangePasswordModal onClose={() => setChangingPassword(false)} />}
      {deletingAccount && <DeleteAccountModal onClose={() => setDeletingAccount(false)} onDeleted={() => navigate('/login', { replace: true, state: { accountDeleted: true } })} />}
    </PortalPage>
  );
}
