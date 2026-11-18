import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { TextField } from '../ui/Field.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Note from '../ui/Note.jsx';

/** Mount conditionally ({open && <ChangePasswordModal />}) so the form starts empty each time. */
export default function ChangePasswordModal({ onClose }) {
  const toast = useToast();
  const { changePassword } = useAuth();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    const next = {};
    if (!form.current) next.current = 'Enter your current password';
    if (form.next.length < 8) next.next = 'Use at least 8 characters';
    if (form.confirm !== form.next || !form.confirm) next.confirm = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true); setServerError('');
    const result = await changePassword(form.current, form.next);
    setLoading(false);
    if (!result.ok) { setServerError(result.error); return; }
    onClose();
    toast('Password updated');
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Change password"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={loading} onClick={submit}>Update password</Button></>}
    >
      <div className="flex flex-col gap-3">
        {serverError && <Note tone="danger" role="alert">{serverError}</Note>}
        <TextField label="Current password" type="password" value={form.current} onChange={set('current')} error={errors.current} autoComplete="current-password" />
        <TextField label="New password" type="password" hint="At least 8 characters" value={form.next} onChange={set('next')} error={errors.next} autoComplete="new-password" />
        <TextField label="Confirm new password" type="password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} autoComplete="new-password" />
      </div>
    </Modal>
  );
}
