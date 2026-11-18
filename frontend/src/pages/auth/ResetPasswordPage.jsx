import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthLayout, { BackToWebsite } from '../../layouts/AuthLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import { TextField } from '../../components/ui/Field.jsx';
import Note from '../../components/ui/Note.jsx';
import { post } from '../../api/client.js';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password.length < 8) return setError('Use at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true); setError('');
    try {
      await post('/auth/password-reset/confirm', { token: params.get('token') || '', password });
      setComplete(true);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout variant="portal" panel={{ title: 'Choose a new password.', text: 'Password reset links expire after one hour.' }}>
      {complete ? <div className="text-center"><h1>Password updated</h1><p className="text-ink-2">You can now sign in with your new password.</p><Button to="/login" size="lg" className="mt-5 w-full">Go to login</Button></div> : (
        <form onSubmit={submit}>
          <h1 className="mb-1.5">Set a new password</h1>
          <p className="mb-5 text-ink-2">Choose a password with at least 8 characters.</p>
          {error && <Note tone="danger" role="alert" className="mb-3.5">{error}</Note>}
          <div className="flex flex-col gap-3.5">
            <TextField label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            <TextField label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            <Button size="lg" type="submit" loading={loading}>Update password</Button>
            <Link to="/login" className="text-center text-[12.5px] font-medium text-wine no-underline hover:underline">Return to login</Link>
          </div>
        </form>
      )}
      <BackToWebsite />
    </AuthLayout>
  );
}
