import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Award, CalendarDays, FileText } from 'lucide-react';
import AuthLayout, { BackToWebsite } from '../../layouts/AuthLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import { CheckboxField, PasswordField, TextField } from '../../components/ui/Field.jsx';
import Note from '../../components/ui/Note.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const perks = [
  [FileText, 'Submit and track your requests'],
  [CalendarDays, 'See your appointments and parish events'],
  [Award, 'Track your certificates'],
];

export default function LoginPage() {
  const { parishioner, loginParishioner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // "from" and "service" are set when a public page asked the visitor to log in first.
  const { from, service } = location.state ?? {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (parishioner) return <Navigate to={from ?? '/portal'} replace state={service ? { service } : undefined} />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginParishioner(email, password);
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    navigate(from ?? '/portal', { replace: true, state: service ? { service } : undefined });
  };

  const extra = (
    <ul className="mt-[22px] flex list-none flex-col gap-2.5 p-0">
      {perks.map(([Icon, text]) => (
        <li key={text} className="flex items-center gap-2.5 text-sm font-medium text-wine-9">
          <i className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-wine"><Icon size={15} aria-hidden="true" /></i>
          {text}
        </li>
      ))}
    </ul>
  );

  return (
    <AuthLayout variant="portal" panel={{ title: 'Welcome home to St. Isidore Parish.', text: 'Request sacraments, follow your appointments and stay in touch with the parish office, wherever you are.', extra }}>
      <form onSubmit={submit} noValidate>
        <h1 className="mb-1.5">Welcome back</h1>
        <p className="mb-6 text-ink-2">Sign in to your parishioner account.</p>
        <div className="flex flex-col gap-4">
          {location.state?.accountDeleted && <Note role="status">Your account was deleted. Parish request and appointment history was retained for parish records.</Note>}
          {from && <Note>Please log in to continue with your request.</Note>}
          {error && <Note tone="danger" role="alert">{error}{error.toLowerCase().includes('verify') && <><br /><Link to={`/verify-email?email=${encodeURIComponent(email.trim())}`} state={{ emailSent: true, returnTo: location.state }} className="font-medium text-wine underline">Resend verification email</Link></>}</Note>}
          <TextField label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            labelAside={<Link to="/forgot-password" className="text-[12.5px] font-medium text-wine no-underline hover:underline">Forgot password?</Link>}
          />
          <CheckboxField className="items-center" defaultChecked>Remember me</CheckboxField>
          <Button size="lg" type="submit" loading={loading}>{loading ? 'Signing in' : 'Sign in'}</Button>
        </div>
        <p className="mt-[26px] text-center text-ink-2">
          New to the parish? <Link to="/register" state={location.state} className="font-medium text-wine no-underline hover:underline">Create an account</Link>
        </p>
        <p className="mt-2.5 text-center text-[12.5px] text-ink-3">
          Parish staff? <Link to="/admin/login" className="font-medium text-wine no-underline hover:underline">Admin sign in</Link>
        </p>
        <BackToWebsite />
      </form>
    </AuthLayout>
  );
}
