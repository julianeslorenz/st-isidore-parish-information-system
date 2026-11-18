import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar.jsx';
import AdminTopbar from '../components/navigation/AdminTopbar.jsx';
import BottomNavigation from '../components/navigation/BottomNavigation.jsx';
import { ADMIN_BOTTOM_TABS, ADMIN_SCREENS } from '../data/adminNav.js';
import { AdminShellProvider, useAdminShell } from '../context/AdminShellContext.jsx';
import { canOpenScreen, useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';

function Shell() {
  const { admin } = useAuth();
  const { meta } = useAdminShell();
  const { requests, adminConversations, dashboard } = useData();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef(null);

  // Navigating closes the drawer and returns the scroll container to the top.
  useEffect(() => {
    setMenuOpen(false);
    mainRef.current?.scrollTo?.({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const badgeCounts = {
    requests: Number(dashboard?.requests ?? requests.length),
    messages: adminConversations.reduce((count, conversation) => count + Number(conversation.unread || 0), 0),
  };
  const addBadgeCount = (items) => items.map((item) => ({
    ...item,
    badge: item.badgeKey ? badgeCounts[item.badgeKey] : item.badge,
  }));
  const screens = addBadgeCount(ADMIN_SCREENS).filter((s) => canOpenScreen(admin, s.key));
  const tabs = addBadgeCount(ADMIN_BOTTOM_TABS).filter((t) => canOpenScreen(admin, t.key));
  const searchTarget = canOpenScreen(admin, 'parishioners') ? '/admin/parishioners' : canOpenScreen(admin, 'requests') ? '/admin/requests' : null;

  return (
    <div className="relative flex h-screen overflow-hidden bg-paper">
      <Sidebar screens={screens} account={admin} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      {menuOpen && <div className="fixed inset-0 z-[15] bg-[rgba(43,23,27,.45)] md:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <AdminTopbar account={admin} title={meta.title} crumb={meta.crumb} onMenu={() => setMenuOpen(true)} searchTarget={searchTarget} />
        <main ref={mainRef} className="flex-1 overflow-auto px-8 pb-12 pt-7 max-md:px-4 max-md:pb-24 max-md:pt-5">
          <Outlet />
        </main>
        <BottomNavigation tabs={tabs} onMore={() => setMenuOpen(true)} label="Admin quick navigation" />
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return <AdminShellProvider><Shell /></AdminShellProvider>;
}
