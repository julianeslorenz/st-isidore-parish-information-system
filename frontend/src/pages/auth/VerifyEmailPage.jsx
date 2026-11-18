import { useEffect, useState } from 'react';
import { Check, MailCheck } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout, { BackToWebsite } from '../../layouts/AuthLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Note from '../../components/ui/Note.jsx';
import { TextField } from '../../components/ui/Field.jsx';
import { isEmail } from '../../utils/format.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, resendVerificationEmail } = useAuth();
  const token = params.get('token') || '';
  const [email, setEmail] = useState(params.get('email') || '');
  const [state, setState] = useState(token ? 'checking' : 'pending');
  const [emailSent, setEmailSent] = useState(location.state?.emailSent !== false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    let current = true;
    verifyEmail(token).then((result) => {
      if (!current) return;
      if (result.ok) setState('verified');
      else { setState('failed'); setError(result.error); }
    });
    return () => { current = false; };
  }, [token, verifyEmail]);

  const resend = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!isEmail(email)) { setError('Enter a valid email address.'); return; }
    setResending(true);
    const result = await resendVerificationEmail(email);
    setResending(false);
    if (!result.ok) { setError(result.error); return; }
    setEmailSent(true);
    setState('pending');
    setMessage('If this account still needs verification, a new link will be sent. Check your inbox and spam folder.');
  };

  const panel = { title: 'One last step.', text: 'Verify your email address to keep your parishioner account secure.' };

  if (state === 'checking') {
    return <AuthLayout variant="portal" panel={panel}><div className="py-8 text-center"><MailCheck size={38} className="mx-auto text-wine" /><h1 className="mb-1 mt-4">Checking your link</h1><p className="text-ink-2">Please wait while we verify your email.</p></div><BackToWebsite /></AuthLayout>;
  }

  if (state === 'verified') {
    return (
      <AuthLayout variant="portal" panel={panel}>
        <div className="text-center">
          <div className="inline-flex h-[72px] w-[72px] items-center justify-center rounded-full bg-ok-bg text-ok"><Check size={36} aria-hidden="true" /></div>
          <h1 className="mb-1.5 mt-3.5">Email verified</h1>
          <p className="text-ink-2">Your account is ready. You can now sign in.</p>
          <Button size="lg" className="mt-5 w-full" onClick={() => navigate('/login', { replace: true, state: location.state?.returnTo })}>Continue to sign in</Button>
        </div>
        <BackToWebsite />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="portal" panel={panel}>
      <form onSubmit={resend} noValidate>
        <h1 className="mb-1.5">Verify your email</h1>
        {state === 'failed' ? (
          <Note tone="danger" role="alert" className="mb-4">{error || 'This verification link is invalid or expired.'} You can request another link below.</Note>
        ) : emailSent ? (
          <Note className="mb-4">We sent a verification link to your email. Open it to verify your account, then return here to sign in.</Note>
        ) : (
          <Note tone="danger" className="mb-4">The account was created, but the email could not be sent. Check the SMTP settings in `backend/.env`, then request a new link.</Note>
        )}
        {message && <Note className="mb-4" role="status">{message}</Note>}
        {error && state !== 'failed' && <Note tone="danger" role="alert" className="mb-4">{error}</Note>}
        <div className="flex flex-col gap-4">
          <TextField label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          <Button size="lg" type="submit" loading={resending}>{resending ? 'Sending' : 'Resend verification email'}</Button>
        </div>
        <p className="mt-5 text-center text-[13px] text-ink-2">Already verified? <Link to="/login" state={location.state?.returnTo} className="font-medium text-wine no-underline hover:underline">Sign in</Link></p>
        <BackToWebsite />
      </form>
    </AuthLayout>
  );
}
