import { Icons } from '../utils/icons.js';

// Admin navigation exactly as grouped in the prototype sidebar.
export const ADMIN_SCREENS = [
  { key: 'dashboard', to: '/admin/dashboard', label: 'Dashboard', icon: Icons.dash, group: 'Overview' },
  { key: 'requests', to: '/admin/requests', label: 'Requests', icon: Icons.file, group: 'Overview', badgeKey: 'requests' },
  { key: 'appointments', to: '/admin/appointments', label: 'Appointments', icon: Icons.cal, group: 'Overview' },
  { key: 'events', to: '/admin/events', label: 'Event calendar', icon: Icons.star, group: 'Overview' },
  { key: 'parishioners', to: '/admin/parishioners', label: 'Parishioners', icon: Icons.users, group: 'Records' },
  { key: 'certificates', to: '/admin/certificates', label: 'Certificates', icon: Icons.award, group: 'Records' },
  { key: 'records', to: '/admin/records', label: 'Sacramental records', icon: Icons.file, group: 'Records' },
  { key: 'priests', to: '/admin/priests', label: 'Priests', icon: Icons.church, group: 'Records' },
  { key: 'messages', to: '/admin/messages', label: 'Messages', icon: Icons.mail, group: 'Communication', badgeKey: 'messages' },
  { key: 'reports', to: '/admin/reports', label: 'Reports', icon: Icons.chart, group: 'Communication' },
  { key: 'users', to: '/admin/users', label: 'User accounts', icon: Icons.gear, group: 'Communication' },
];

// Bottom tab bar on small screens; "More" opens the full sidebar drawer.
export const ADMIN_BOTTOM_TABS = [
  { key: 'dashboard', to: '/admin/dashboard', label: 'Home', icon: Icons.dash },
  { key: 'requests', to: '/admin/requests', label: 'Requests', icon: Icons.file, badgeKey: 'requests' },
  { key: 'appointments', to: '/admin/appointments', label: 'Calendar', icon: Icons.cal },
  { key: 'parishioners', to: '/admin/parishioners', label: 'People', icon: Icons.users },
];
