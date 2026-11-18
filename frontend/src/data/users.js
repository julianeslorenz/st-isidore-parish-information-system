// Role and permission model used to control which frontend screens are shown.
export const ROLES = ['Admin', 'Parish Secretary', 'Parish Staff', 'Priest'];

export const ROLE_DESCRIPTIONS = [
  ['Admin', 'All screens, user accounts and reports'],
  ['Parish Secretary', 'Requests, appointments, parishioners, certificates, messages'],
  ['Parish Staff', 'Requests, appointments and messages (no certificate signing)'],
  ['Priest', 'Own appointments and certificate signing'],
];

// Which admin screens each role can open (keys match data/adminNav.js).
export const ROLE_SCREENS = {
  Admin: ['dashboard', 'requests', 'appointments', 'events', 'parishioners', 'certificates', 'records', 'priests', 'messages', 'reports', 'users', 'profile'],
  'Parish Secretary': ['dashboard', 'requests', 'appointments', 'events', 'parishioners', 'certificates', 'records', 'priests', 'messages', 'profile'],
  'Parish Staff': ['dashboard', 'requests', 'appointments', 'events', 'messages', 'profile'],
  Priest: ['dashboard', 'appointments', 'certificates', 'profile'],
};

// Fine-grained actions. Certificates follow the parish workflow: staff prepare and print,
// only a priest signs, staff release.
export const PERMISSIONS = {
  'request.decide': ['Admin', 'Parish Secretary', 'Parish Staff'],
  'certificate.prepare': ['Admin', 'Parish Secretary'],
  'certificate.print': ['Admin', 'Parish Secretary'],
  'certificate.sign': ['Admin', 'Priest'],
  'certificate.release': ['Admin', 'Parish Secretary'],
  'certificate.revoke': ['Admin'],
};

