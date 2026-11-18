import { Icons } from '../utils/icons.js';

export const PORTAL_LINKS = [
  { to: '/portal', label: 'Home', end: true },
  { to: '/portal/requests', label: 'My requests' },
  { to: '/portal/appointments', label: 'Appointments' },
  { to: '/portal/messages', label: 'Messages', badgeKey: 'messages' },
  { to: '/portal/certificates', label: 'Certificates' },
];

export const PORTAL_BOTTOM_TABS = [
  { to: '/portal', label: 'Home', icon: Icons.home, end: true },
  { to: '/portal/requests', label: 'Requests', icon: Icons.file },
  { to: '/portal/appointments', label: 'Visits', icon: Icons.cal },
  { to: '/portal/messages', label: 'Messages', icon: Icons.msg, badgeKey: 'messages' },
  { to: '/portal/profile', label: 'Me', icon: Icons.user },
];
