import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import AuthLayout, { BackToWebsite } from '../../layouts/AuthLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import { TextField } from '../../components/ui/Field.jsx';
import { isEmail } from '../../utils/format.js';
import { post } from '../../api/client.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const value = email.trim();
    if (!isEmail(value)) return setError('Enter a valid email address');
    setError('');
    setLoading(true);
    try { await post('/auth/password-reset', { email: value }); setSent(true); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout variant="portal" panel={{ title: 'Forgot your password?', text: 'We will email you a link to choose a new one.' }}>
      {sent ? (
        <div className="text-center">
          <div className="inline-flex h-[72px] w-[72px] items-center justify-center rounded-full bg-ok-bg text-ok"><Mail size={32} aria-hidden="true" /></div>
          <h1 className="mb-1.5 mt-3.5">Check your email</h1>
          <p className="text-ink-2">Reset instructions were sent to <b>{email.trim()}</b>.</p>
          <Button to="/login" size="lg" className="mt-5 w-full">Back to login</Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <h1 className="mb-1.5">Reset password</h1>
          <p className="mb-5 text-ink-2">Enter the email you registered with.</p>
          <div className="flex flex-col gap-3.5">
            <TextField label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} autoComplete="email" />
            <Button size="lg" type="submit" loading={loading}>Send reset link</Button>
            <Link to="/login" className="text-center text-[12.5px] font-medium text-wine no-underline hover:underline">Return to login</Link>
          </div>
        </form>
      )}
      <BackToWebsite />
    </AuthLayout>
  );
}
