import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout, { BackToWebsite } from '../../layouts/AuthLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import { CheckboxField, PasswordField, TextField } from '../../components/ui/Field.jsx';
import Note from '../../components/ui/Note.jsx';
import { isEmail } from '../../utils/format.js';
import { useAuth } from '../../context/AuthContext.jsx';

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = 'Enter your full name';
  if (!isEmail(v.email)) e.email = 'Enter a valid email address';
  if (!/^09\d{2} ?\d{3} ?\d{4}$/.test(v.mobile.trim())) e.mobile = 'Enter a valid mobile number, like 0917 555 0142';
  if (v.password.length < 8 || !/\d/.test(v.password) || !/[A-Za-z]/.test(v.password)) e.password = 'Use at least 8 characters with a letter and a number';
  if (!v.confirm || v.confirm !== v.password) e.confirm = 'Passwords do not match';
  if (!v.terms) e.terms = 'Please accept the terms to continue';
  return e;
}

export default function RegisterPage() {
  const { registerParishioner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ name: '', email: '', mobile: '', barangay: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setLoading(true);
    setServerError('');
    const result = await registerParishioner(values);
    setLoading(false);
    if (!result.ok) { setServerError(result.error); return; }
    navigate(`/verify-email?email=${encodeURIComponent(values.email.trim())}`, {
      replace: true,
      state: { emailSent: result.emailSent, returnTo: location.state },
    });
  };

  const panel = { title: 'Join the parish online.', text: 'Create a parishioner account to request sacraments and follow your requests.' };

  return (
    <AuthLayout variant="portal" panel={panel}>
      <form onSubmit={submit} noValidate>
        <h1 className="mb-1.5">Create account</h1>
        <p className="mb-5 text-ink-2">Already registered? <Link to="/login" state={location.state} className="font-medium text-wine no-underline hover:underline">Login</Link></p>
        {Object.keys(errors).length > 0 && <Note tone="danger" role="alert" className="mb-3.5">Please fix the highlighted fields.</Note>}
        {serverError && <Note tone="danger" role="alert" className="mb-3.5">{serverError}</Note>}
        <div className="flex flex-col gap-3.5">
          <TextField label="Full name" placeholder="As on your ID" value={values.name} onChange={set('name')} error={errors.name} autoComplete="name" />
          <TextField label="Email address" type="email" value={values.email} onChange={set('email')} error={errors.email} autoComplete="email" />
          <TextField label="Contact number" placeholder="0917 555 0142" value={values.mobile} onChange={set('mobile')} error={errors.mobile} autoComplete="tel" />
          <TextField label="Barangay (optional)" value={values.barangay} onChange={set('barangay')} />
          <PasswordField label="Password" hint="At least 8 characters, with a letter and a number" value={values.password} onChange={set('password')} error={errors.password} autoComplete="new-password" />
          <PasswordField label="Confirm password" value={values.confirm} onChange={set('confirm')} error={errors.confirm} autoComplete="new-password" />
          <CheckboxField checked={values.terms} onChange={set('terms')}>I agree to the Terms of Use and the Privacy Notice.</CheckboxField>
          {errors.terms && <span role="alert" className="text-[12.5px] text-bad">{errors.terms}</span>}
          <Button size="lg" type="submit" loading={loading}>{loading ? 'Creating' : 'Create account'}</Button>
        </div>
        <BackToWebsite />
      </form>
    </AuthLayout>
  );
}
