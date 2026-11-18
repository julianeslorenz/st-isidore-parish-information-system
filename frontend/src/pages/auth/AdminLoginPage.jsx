import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import Logo from '../../components/ui/Logo.jsx';
import Button from '../../components/ui/Button.jsx';
import { CheckboxField, PasswordField, TextField } from '../../components/ui/Field.jsx';
import Note from '../../components/ui/Note.jsx';
import { ADMIN_SCREENS } from '../../data/adminNav.js';
import { firstAllowedPath, useAuth } from '../../context/AuthContext.jsx';

export default function AdminLoginPage() {
  const { admin, loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (admin) return <Navigate to={firstAllowedPath(admin, ADMIN_SCREENS)} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginAdmin(email, password);
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    navigate(location.state?.from ?? firstAllowedPath(result.account, ADMIN_SCREENS), { replace: true });
  };

  return (
    <AuthLayout
      variant="admin"
      panel={{ title: 'Everything the parish office needs, in one place.', text: 'Review sacrament requests, schedule priests and keep parish records accurate and up to date.' }}
    >
      <form onSubmit={submit} noValidate>
        <div className="mb-7 flex items-center gap-3">
          <Logo size={44} />
          <div>
            <b className="block font-serif text-xl font-semibold leading-[1.1]">St. Isidore Parish</b>
            <span className="text-[12.5px] text-ink-2">Parish administration</span>
          </div>
        </div>
        <h1 className="mb-1.5">Sign in</h1>
        <p className="mb-6 text-ink-2">Use your parish staff account to manage requests and records.</p>
        <div className="flex flex-col gap-4">
          {error && <Note tone="danger" role="alert">{error}</Note>}
          <TextField label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            labelAside={<Link to="/forgot-password" className="text-[12.5px] font-medium text-wine no-underline hover:underline">Forgot password?</Link>}
          />
          <CheckboxField className="items-center" defaultChecked>Keep me signed in on this device</CheckboxField>
          <Button size="lg" type="submit" loading={loading}>{loading ? 'Signing in' : 'Sign in'}</Button>
        </div>

        <p className="mt-7 text-[12.5px] text-ink-3">
          Parishioner? <Link to="/login" className="font-medium text-wine no-underline hover:underline">Go to the parishioner portal</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
