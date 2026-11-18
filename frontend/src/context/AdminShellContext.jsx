import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Lets each admin page tell the shared top bar its title and breadcrumb (prototype aShell args).
const AdminShellContext = createContext({ meta: { title: '', crumb: '' }, setMeta: () => {} });

export function AdminShellProvider({ children }) {
  const [meta, setMeta] = useState({ title: '', crumb: '' });
  const value = useMemo(() => ({ meta, setMeta }), [meta]);
  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export const useAdminShell = () => useContext(AdminShellContext);

/** Call at the top of an admin page: usePageMeta('Requests', 'Overview'). */
export function usePageMeta(title, crumb) {
  const { setMeta } = useAdminShell();
  useEffect(() => {
    setMeta({ title, crumb });
    document.title = `${title} · St. Isidore Parish`;
  }, [title, crumb, setMeta]);
}
