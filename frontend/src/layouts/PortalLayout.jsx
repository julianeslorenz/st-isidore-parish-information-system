import { Outlet } from 'react-router-dom';
import PortalHeader from '../components/navigation/PortalHeader.jsx';
import BottomNavigation from '../components/navigation/BottomNavigation.jsx';
import { PORTAL_BOTTOM_TABS } from '../data/portalNav.js';
import { useData } from '../context/DataContext.jsx';

export default function PortalLayout() {
  const { userConversations } = useData();
  const unread = userConversations.reduce((sum, c) => sum + c.unread, 0);
  const tabs = PORTAL_BOTTOM_TABS.map((t) => (t.badgeKey === 'messages' && unread ? { ...t, badge: unread } : t));

  return (
    <div className="min-h-screen bg-paper">
      <PortalHeader unreadMessages={unread} />
      <main className="pb-14 max-md:pb-24"><Outlet /></main>
      <BottomNavigation tabs={tabs} badgeTone="wine" label="Portal quick navigation" />
    </div>
  );
}
