import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, patch, post, setToken } from '../api/client.js';
import { PERMISSIONS, ROLE_SCREENS } from '../data/users.js';

const AuthContext = createContext(null);
const changed = () => window.dispatchEvent(new Event('stisidore-auth-changed'));

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me').then(setAccount).catch(() => { setToken(null); changed(); }).finally(() => setLoading(false));
  }, []);

  const authenticate = useCallback(async (email, password, wantedStaff) => {
    try {
      const result = await post('/auth/login', { email: email.trim(), password });
      const isStaff = ['Admin', 'Parish Secretary', 'Parish Staff', 'Priest'].includes(result.user.role);
      if (isStaff !== wantedStaff) return { ok: false, error: wantedStaff ? 'This account does not have parish staff access.' : 'Please use the parish staff sign in.' };
      setToken(result.access_token);
      setAccount(result.user);
      changed();
      return { ok: true, account: result.user };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }, []);

  const loginAdmin = useCallback((email, password) => authenticate(email, password, true), [authenticate]);
  const loginParishioner = useCallback((email, password) => authenticate(email, password, false), [authenticate]);
  const registerParishioner = useCallback(async (values) => {
    try {
      const result = await post('/auth/register', { email: values.email.trim(), name: values.name.trim(), password: values.password, contact_number: values.mobile.trim(), barangay: values.barangay || null });
      return { ok: true, emailSent: result.email_sent };
    } catch (error) { return { ok: false, error: error.message }; }
  }, []);
  const verifyEmail = useCallback(async (token) => {
    try { return { ok: true, ...(await post('/auth/verify-email', { token })) }; }
    catch (error) { return { ok: false, error: error.message }; }
  }, []);
  const resendVerificationEmail = useCallback(async (email) => {
    try { return { ok: true, ...(await post('/auth/verification/resend', { email: email.trim() })) }; }
    catch (error) { return { ok: false, error: error.message }; }
  }, []);
  const updateProfile = useCallback(async (values) => {
    try { const updated = await patch('/auth/me', values); setAccount(updated); return { ok: true, account: updated }; }
    catch (error) { return { ok: false, error: error.message }; }
  }, []);
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const result = await post('/auth/change-password', { current_password: currentPassword, new_password: newPassword });
      setToken(result.access_token); setAccount(result.user); return { ok: true };
    } catch (error) { return { ok: false, error: error.message }; }
  }, []);
  const deleteAccount = useCallback(async (password) => {
    try {
      await api('/auth/me', { method: 'DELETE', body: JSON.stringify({ password, confirmation: 'DELETE' }) });
      setToken(null);
      setAccount(null);
      changed();
      return { ok: true };
    } catch (error) { return { ok: false, error: error.message }; }
  }, []);
  const logout = useCallback(() => {
    setToken(null);
    setAccount(null);
    changed();
  }, []);

  const isStaff = account && ['Admin', 'Parish Secretary', 'Parish Staff', 'Priest'].includes(account.role);
  const value = useMemo(() => ({
    admin: isStaff ? account : null,
    parishioner: account && !isStaff ? { ...account, id: account.id, name: account.name } : null,
    account, loading,
    loginAdmin, loginParishioner, registerParishioner, verifyEmail, resendVerificationEmail, updateProfile, changePassword, deleteAccount,
    logoutAdmin: logout, logoutParishioner: logout,
  }), [account, isStaff, loading, loginAdmin, loginParishioner, registerParishioner, verifyEmail, resendVerificationEmail, updateProfile, changePassword, deleteAccount, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export const canOpenScreen = (account, screenKey) => !!account && ROLE_SCREENS[account.role]?.includes(screenKey);
export const can = (account, permission) => !!account && !!PERMISSIONS[permission]?.includes(account.role);
export const firstAllowedPath = (account, screens) => screens.find((s) => canOpenScreen(account, s.key))?.to ?? '/admin/profile';

