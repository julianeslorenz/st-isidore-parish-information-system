import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import KeyValue from '../../components/ui/KeyValue.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { TextField } from '../../components/ui/Field.jsx';
import ChangePasswordModal from '../../components/modals/ChangePasswordModal.jsx';
import { usePageMeta } from '../../context/AdminShellContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminProfilePage() {
  usePageMeta('My account', 'Settings');
  const { admin } = useAuth();
  const toast = useToast();
  const [changingPassword, setChangingPassword] = useState(false);
  const [settings, setSettings] = useState({ hours: 'Mon to Fri, 8:00 AM to 5:00 PM', review: '3 working days' });
  const set = (key) => (e) => setSettings((s) => ({ ...s, [key]: e.target.value }));

  return (
    <>
      <PageHeader title={admin.name} subtitle={admin.role} avatar={<Avatar name={admin.name} size={64} />} />
      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        <Card>
          <CardHeader title="Account" />
          <CardBody>
            <KeyValue labelWidth={100} items={[['Email', admin.email], ['Role', admin.role], ['Last login', admin.lastLogin]]} />
            <div className="mt-4"><Button variant="secondary" onClick={() => setChangingPassword(true)}>Change password</Button></div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Notifications" />
          <CardBody className="flex flex-col gap-3.5">
            {['New requests', 'Certificates ready for pickup', 'New messages'].map((label) => (
              <div key={label} className="flex items-center gap-3"><span>{label}</span><span className="flex-1" /><Toggle label={label} defaultChecked /></div>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Parish settings" />
          <CardBody className="flex flex-col gap-3.5">
            <TextField label="Office hours" value={settings.hours} onChange={set('hours')} />
            <TextField label="Request review time" value={settings.review} onChange={set('review')} />
            <div><Button onClick={() => toast('Settings saved')}>Save settings</Button></div>
          </CardBody>
        </Card>
      </div>
      {changingPassword && <ChangePasswordModal onClose={() => setChangingPassword(false)} />}
    </>
  );
}
