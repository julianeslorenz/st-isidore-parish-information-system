// Admin request records, generated the same way the prototype's rowsFor() did.
export const REQUEST_TYPES = ['Baptism', 'Marriage', 'Confirmation', 'Funeral'];
export const REQUEST_PREFIX = { Baptism: 'BR', Marriage: 'MR', Confirmation: 'CR', Funeral: 'FR' };

const CHILD_NAMES = ['Gabriel Dela Cruz', 'Althea Villanueva', 'Noah Bautista', 'Sophia Santos', 'Elijah Mendoza', 'Isabella Reyes', 'Lucas Garcia', 'Amara Pascual', 'Ethan Navarro', 'Chloe Aquino', 'Miguel Ramos', 'Hannah Torres'];
const ADULT_NAMES = ['Jose Ramon Villanueva', 'Angelica Mae Bautista', 'Rogelio Santos', 'Katrina Joy Mendoza', 'Paolo Antonio Reyes', 'Lourdes Garcia', 'Mark Anthony Pascual', 'Elena Navarro', 'Ricardo Aquino', 'Sofia Isabel Ramos', 'Daniel Torres', 'Teresa Cruz'];
const APPLICANTS = ['Maria Cristina Dela Cruz', 'Jose Ramon Villanueva', 'Angelica Mae Bautista', 'Rogelio Santos', 'Katrina Joy Mendoza', 'Paolo Antonio Reyes', 'Lourdes Garcia', 'Mark Anthony Pascual', 'Elena Navarro', 'Ricardo Aquino', 'Sofia Isabel Ramos', 'Daniel Torres'];
const STATUSES = ['pending', 'pending', 'approved', 'pending', 'rescheduled', 'completed', 'pending', 'approved', 'rejected', 'completed', 'pending', 'approved'];
const REQUESTED = ['Oct 25, 2026', 'Oct 25, 2026', 'Nov 1, 2026', 'Nov 8, 2026', 'Nov 15, 2026', 'Oct 11, 2026', 'Nov 22, 2026', 'Oct 31, 2026', 'Oct 18, 2026', 'Oct 4, 2026', 'Dec 6, 2026', 'Nov 29, 2026'];
const SUBMITTED = ['Oct 12, 2026', 'Oct 12, 2026', 'Oct 11, 2026', 'Oct 10, 2026', 'Oct 9, 2026', 'Sep 28, 2026', 'Oct 8, 2026', 'Oct 7, 2026', 'Oct 5, 2026', 'Sep 22, 2026', 'Oct 3, 2026', 'Oct 1, 2026'];

// The prototype offsets the shared arrays per sacrament so each tab looks different.
const OFFSETS = {
  Baptism: { date: 0, status: 0 },
  Marriage: { date: 3, status: 2 },
  Confirmation: { date: 5, status: 4 },
  Funeral: { date: 7, status: 6 },
};

const describeSubject = (type, i) => {
  if (type === 'Baptism') return `Infant: ${CHILD_NAMES[i]}`;
  if (type === 'Marriage') return `With ${ADULT_NAMES[i]}`;
  if (type === 'Confirmation') return `Candidate: ${CHILD_NAMES[(i + 3) % 12].split(' ')[0]} ${APPLICANTS[i].split(' ').pop()}`;
  return `Deceased: ${ADULT_NAMES[(i + 5) % 12]}`;
};

function buildTimeline({ applicant, submitted, requested, status }) {
  const tl = [
    { text: `Request submitted by ${applicant}`, when: `${submitted}, 9:14 AM`, state: 'done' },
    { text: '4 supporting documents uploaded', when: `${submitted}, 9:16 AM`, state: 'done' },
    { text: 'Assigned to Fr. Miguel Santos', when: `${submitted}, 2:30 PM`, state: 'done' },
  ];
  if (status === 'pending') tl.push({ text: 'Waiting for staff review', when: 'Now', state: 'current' });
  if (status === 'approved') tl.push({ text: 'Approved by Maria Santos', when: 'Oct 12, 4:05 PM', state: 'done' });
  if (status === 'completed') {
    tl.push({ text: 'Approved', when: 'Oct 5', state: 'done' }, { text: 'Sacrament completed', when: requested, state: 'done' });
  }
  if (status === 'rejected') tl.push({ text: 'Rejected: documents incomplete', when: 'Oct 6', state: 'done' });
  if (status === 'rescheduled') tl.push({ text: `Rescheduled to ${requested}`, when: 'Oct 9', state: 'done' });
  return tl;
}

export function buildRequests() {
  return REQUEST_TYPES.flatMap((type) =>
    APPLICANTS.map((applicant, i) => {
      const requested = REQUESTED[(i + OFFSETS[type].date) % 12];
      const submitted = SUBMITTED[i];
      const status = STATUSES[(i + OFFSETS[type].status) % 12];
      return {
        id: `${REQUEST_PREFIX[type]}-2026-${String(48 - i).padStart(3, '0')}`,
        type,
        applicant,
        subject: describeSubject(type, i),
        child: CHILD_NAMES[i],
        requested,
        submitted,
        status,
        priest: 'Fr. Miguel Santos',
        timeline: buildTimeline({ applicant, submitted, requested, status }),
      };
    }),
  );
}

// Progress stages shown in the request detail card.
export const REQUEST_STAGES = ['Submitted', 'Under review', 'Approved', 'Completed'];
export const STAGE_INDEX = { pending: 1, approved: 2, rescheduled: 2, completed: 3, rejected: 1, cancelled: 1 };

export const REQUEST_DOCUMENTS = [
  { name: 'Birth certificate of the child', meta: 'PSA, 1 page', verified: true },
  { name: 'Marriage certificate of parents', meta: 'PDF, 1 page', verified: true },
  { name: 'Valid ID of the parent', meta: 'JPG, 340 KB', verified: true },
  { name: "Godparents' pre-baptismal seminar certificate", meta: 'PDF, 1 page', verified: false },
];

export const REQUEST_STATUS_FILTERS = ['all', 'pending', 'approved', 'rescheduled', 'completed', 'rejected'];
export const REQUEST_DATE_FILTERS = [
  { value: 'any', label: 'Any requested date' },
  { value: 'oct', label: 'October 2026' },
  { value: 'nov', label: 'November 2026' },
  { value: 'later', label: 'December and later' },
];
