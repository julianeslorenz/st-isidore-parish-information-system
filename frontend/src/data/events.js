// Calendar event categories and colours (prototype EVT).
export const EVENT_KINDS = {
  mass: { label: 'Sunday Mass', color: '#6B1D2A' },
  bap: { label: 'Baptism', color: '#3F6E8C' },
  feast: { label: 'Parish Feast', color: '#B8892F' },
  conf: { label: 'Confirmation', color: '#5B7F4F' },
  wed: { label: 'Marriage Ceremony', color: '#A24A62' },
  out: { label: 'Community Outreach', color: '#3E7F7B' },
};

export const EVENT_START_TIMES = ['6:00 AM', '8:00 AM', '10:00 AM', '2:00 PM', '4:00 PM'];

const sundayMasses = [4, 11, 18, 25].map((day) => ({ day, kind: 'mass', title: 'Sunday Mass', time: '8:00 AM' }));

export const EVENTS = [
  ...sundayMasses,
  { day: 3, kind: 'bap', title: 'Baptism', time: '10:00 AM' },
  { day: 10, kind: 'bap', title: 'Baptism', time: '10:00 AM' },
  { day: 17, kind: 'conf', title: 'Confirmation', time: '2:00 PM' },
  { day: 20, kind: 'feast', title: 'Parish Feast', time: '4:00 PM' },
  { day: 24, kind: 'wed', title: 'Marriage Ceremony', time: '10:00 AM' },
  { day: 25, kind: 'bap', title: 'Baptism', time: '9:00 AM' },
  { day: 25, kind: 'out', title: 'Community Outreach', time: '1:00 PM' },
  { day: 31, kind: 'wed', title: 'Marriage Ceremony', time: '2:00 PM' },
].map((event, index) => ({ id: index + 1, ...event }));

export const PUBLIC_EVENT_CATEGORIES = ['All', 'Parish events', 'Religious activities', 'Community', 'Special celebrations'];

export const PUBLIC_EVENTS = [
  { id: 0, month: 'Oct', day: '20', category: 'Special celebrations', title: 'Parish Feast', time: '4:00 PM', location: 'Church grounds', summary: 'Mass followed by the procession.', body: 'The annual feast Mass is followed by a procession around the parish. All are welcome.' },
  { id: 1, month: 'Oct', day: '25', category: 'Community', title: 'Community Outreach', time: '1:00 PM', location: 'Parish hall', summary: 'Share and serve with parish volunteers.', body: 'Volunteers prepare and share meals with neighboring families. Bring a friend and sign up at the parish office.' },
  { id: 2, month: 'Oct', day: '31', category: 'Religious activities', title: 'Pre-Cana Seminar (couples)', time: '2:00 PM', location: 'Seminar hall', summary: 'For couples preparing for marriage.', body: 'Required for couples with a marriage request. Open to couples who have submitted a request with the parish.' },
  { id: 3, month: 'Nov', day: '1', category: 'Special celebrations', title: 'All Saints Day Masses', time: 'See schedule', location: 'St. Isidore Parish Church', summary: 'Solemnity of All Saints.', body: 'Special Mass times will be posted on the Announcements page.' },
  { id: 4, month: 'Nov', day: '2', category: 'Religious activities', title: 'All Souls Day Blessing', time: '9:00 AM', location: 'Parish memorial garden', summary: 'Prayers and blessing for the departed.', body: 'Families are invited to the blessing of the memorial garden.' },
];

// Upcoming parish events shown on the parishioner home card.
export const PORTAL_EVENTS = [
  { day: 20, title: 'Parish Feast', meta: '4:00 PM, Church grounds' },
  { day: 25, title: 'Community Outreach', meta: '1:00 PM, Parish hall' },
];
