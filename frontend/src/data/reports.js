export const REPORT_MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

export const DASHBOARD_STATS = [
  { icon: 'users', value: '1,248', label: 'Total parishioners', detail: '+14 this month' },
  { icon: 'file', value: '24', label: 'Pending requests', detail: '7 need review today', tone: 'warn' },
  { icon: 'cal', value: '12', label: 'Upcoming appointments', detail: 'Next: today 2:00 PM' },
  { icon: 'star', value: '8', label: 'Upcoming events', detail: 'Parish Feast on Oct 20' },
];

export const DASHBOARD_BARS = [
  { label: 'May', value: 38 }, { label: 'Jun', value: 45 }, { label: 'Jul', value: 41 },
  { label: 'Aug', value: 52 }, { label: 'Sep', value: 47 }, { label: 'Oct', value: 24 },
];

export const DASHBOARD_DONUT = [
  { label: 'Baptism', value: 42, color: '#6B1D2A' },
  { label: 'Marriage', value: 24, color: '#B8892F' },
  { label: 'Confirmation', value: 20, color: '#5B7F4F' },
  { label: 'Funeral', value: 14, color: '#9A918A' },
];

export const DASHBOARD_ACTIVITY = [
  { text: 'Maria Cristina Dela Cruz', strong: true, suffix: ' submitted a baptism request', when: '12 minutes ago' },
  { text: 'Fr. Miguel confirmed the Oct 25 baptism rite', when: '1 hour ago' },
  { text: 'Certificate ', strong2: 'BC-2026-0412', suffix: ' issued to Lorenz Santiago', when: 'Yesterday, 4:20 PM' },
  { text: 'Garcia family requested a funeral Mass', when: 'Yesterday, 11:05 AM' },
];

export const REPORT_DATA = {
  'All requests': { m: [38, 45, 41, 52, 47, 24], breakdown: [['Pending', 0.13], ['Completed', 0.76], ['Rejected', 0.11]] },
  Baptism: { m: [16, 19, 17, 22, 20, 10], breakdown: [['Pending', 0.12], ['Completed', 0.77], ['Rejected', 0.11]] },
  Marriage: { m: [9, 11, 10, 12, 11, 6], breakdown: [['Pending', 0.15], ['Completed', 0.73], ['Rejected', 0.12]] },
  Confirmation: { m: [8, 9, 8, 10, 9, 5], breakdown: [['Pending', 0.12], ['Completed', 0.78], ['Rejected', 0.1]] },
  Funeral: { m: [5, 6, 6, 8, 7, 3], breakdown: [['Pending', 0.1], ['Completed', 0.82], ['Rejected', 0.08]] },
  Appointments: { m: [41, 47, 44, 55, 50, 26], breakdown: [['Confirmed', 0.7], ['Rescheduled', 0.18], ['Cancelled', 0.12]] },
  Parishioners: { m: [12, 15, 11, 18, 14, 14], breakdown: [['Active', 0.8], ['New accounts', 0.12], ['Inactive', 0.08]] },
  Certificates: { m: [22, 27, 25, 31, 28, 14], breakdown: [['Released', 0.7], ['In preparation', 0.22], ['Revoked', 0.08]] },
  Events: { m: [6, 7, 8, 9, 10, 5], breakdown: [['Held', 0.8], ['Upcoming', 0.15], ['Cancelled', 0.05]] },
};

export const REPORT_RANGES = [
  { value: '1', label: 'This month' },
  { value: '3', label: 'Last 3 months' },
  { value: '6', label: 'Last 6 months' },
];
