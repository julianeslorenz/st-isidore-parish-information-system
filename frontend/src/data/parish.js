export const PARISH = {
  name: 'St. Isidore Parish',
  address: 'Poblacion I, Agdangan, Quezon 4304, Philippines',
  phone: '(049) 555 0100',
  email: 'parish.office@stisidore.example',
};

export const MASS_SCHEDULE = [
  ['Saturday (anticipated)', '5:00 PM'],
  ['Sunday', '6:00 AM, 8:00 AM, 5:00 PM'],
  ['Weekdays', '6:00 AM'],
];

// Shorter labels used in the parishioner dashboard card.
export const PORTAL_MASS_SCHEDULE = [
  ['Saturday', '5:00 PM'],
  ['Sunday', '6:00 AM, 8:00 AM, 5:00 PM'],
  ['Weekdays', '6:00 AM'],
];

export const OFFICE_HOURS = [
  ['Monday to Friday', '8:00 AM to 5:00 PM'],
  ['Saturday', '8:00 AM to 12:00 NN'],
  ['Sunday', 'Closed (Masses only)'],
];

export const REGULAR_ACTIVITIES = [
  ['Confessions', 'Saturdays, 3:30 to 4:30 PM'],
  ['Rosary', 'Weekdays, after the morning Mass'],
  ['Parish council', 'First Sunday of the month'],
  ['Baptism rites', 'Scheduled by the parish office'],
  ['Weddings', 'By appointment'],
];

export const PUBLIC_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/sacraments', label: 'Sacraments' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/events', label: 'Events' },
  { to: '/announcements', label: 'Announcements' },
  { to: '/contact', label: 'Contact' },
];

export const NOTIFICATIONS = [
  { id: 1, text: 'New baptism request from Maria Cristina Dela Cruz', when: '12 minutes ago', unread: true },
  { id: 2, text: 'Appointment confirmed with Fr. Miguel for Oct 25', when: '1 hour ago', unread: true },
  { id: 3, text: '3 certificates are awaiting signature', when: 'Yesterday', unread: false },
];
