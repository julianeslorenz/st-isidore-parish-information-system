import { Navigate, useLocation } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { canOpenScreen, useAuth } from '../context/AuthContext.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Button from '../components/ui/Button.jsx';
import { usePageMeta } from '../context/AdminShellContext.jsx';

/** Parent route for /admin/*: requires a staff session. */
export function RequireAdmin({ children }) {
  const { admin, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return children;
}

/** Parent route for /portal/*: requires a parishioner session. */
export function RequireParishioner({ children }) {
  const { parishioner, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!parishioner) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

/** Wraps one admin page; shows a friendly message when the role may not open it. */
export function ScreenGate({ screen, children }) {
  const { admin } = useAuth();
  if (canOpenScreen(admin, screen)) return children;
  return <AccessDenied role={admin?.role ?? 'your account'} />;
}

function AccessDenied({ role }) {
  usePageMeta('Access restricted', 'Settings');
  return (
    <EmptyState
      icon={LockKeyhole}
      title="Your role cannot open this screen"
      description={`The ${role} role does not include this part of the system. Ask an administrator if you need access.`}
      action={<Button to="/admin/dashboard" variant="secondary">Back to dashboard</Button>}
    />
  );
}
