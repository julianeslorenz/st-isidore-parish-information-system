import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { TextField } from '../ui/Field.jsx';
import Note from '../ui/Note.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function DeleteAccountModal({ onClose, onDeleted }) {
  const { deleteAccount } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    const result = await deleteAccount(password);
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    onDeleted();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Delete your account?"
      footer={<><Button variant="secondary" onClick={onClose}>Keep my account</Button><Button variant="danger-solid" loading={loading} disabled={!password || confirmation !== 'DELETE'} onClick={submit}>Delete account</Button></>}
    >
      <div className="flex flex-col gap-3.5">
        <Note tone="danger">This removes your sign-in and personal profile details. Parish request and appointment history will be retained for parish records and marked as belonging to a deleted account.</Note>
        {error && <Note tone="danger" role="alert">{error}</Note>}
        <TextField label="Current password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <TextField label="Type DELETE to confirm" autoComplete="off" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
      </div>
    </Modal>
  );
}
