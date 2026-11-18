export const APPOINTMENT_TYPES = ['Baptism', 'Marriage', 'Confirmation', 'Funeral', 'Other'];
export const APPOINTMENT_TIMES = ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM'];
export const APPOINTMENT_PRIESTS = ['Fr. Antonio Reyes', 'Fr. Miguel Santos'];

// kind -> colour key in data/events.js
export const APPOINTMENTS = [
  { id: 1, day: 14, time: '2:00 PM', kind: 'bap', type: 'Baptism', title: 'Baptism interview', who: 'Dela Cruz family', priest: 'Fr. Antonio Reyes', status: 'confirmed', note: 'Parents and godparents will attend. Bring the original birth certificate.' },
  { id: 2, day: 15, time: '10:00 AM', kind: 'wed', type: 'Marriage', title: 'Marriage pre-interview', who: 'Reyes and Santos', priest: 'Fr. Miguel Santos', status: 'confirmed', note: 'First interview before the Pre-Cana seminar.' },
  { id: 3, day: 16, time: '3:00 PM', kind: 'conf', type: 'Confirmation', title: 'Confirmation seminar', who: 'Group B, 18 candidates', priest: 'Fr. Antonio Reyes', status: 'confirmed', note: 'Candidates should bring their sponsor.' },
  { id: 4, day: 17, time: '9:00 AM', kind: 'conf', type: 'Confirmation', title: 'Document verification', who: 'Bautista, Angelica Mae', priest: 'Parish office', status: 'pending', note: 'Baptismal certificate to be verified against parish records.' },
  { id: 5, day: 20, time: '11:00 AM', kind: 'feast', type: 'Event', title: 'Parish Feast planning', who: 'Parish council', priest: 'Fr. Antonio Reyes', status: 'confirmed', note: 'Final run-through of the procession route.' },
  { id: 6, day: 21, time: '9:30 AM', kind: 'mass', type: 'Funeral', title: 'Funeral Mass planning', who: 'Garcia family', priest: 'Fr. Miguel Santos', status: 'pending', note: 'Family requests a Saturday morning Mass.' },
  { id: 7, day: 22, time: '4:00 PM', kind: 'wed', type: 'Marriage', title: 'Pre-Cana seminar', who: '6 couples', priest: 'Fr. Miguel Santos', status: 'confirmed', note: 'Seminar hall, second floor.' },
  { id: 8, day: 24, time: '10:00 AM', kind: 'wed', type: 'Marriage', title: 'Marriage ceremony', who: 'Villanueva and Mendoza', priest: 'Fr. Antonio Reyes', status: 'confirmed', note: 'Rehearsal held on Oct 22 at 4:00 PM.' },
  { id: 9, day: 25, time: '9:00 AM', kind: 'bap', type: 'Baptism', title: 'Baptism rite', who: 'Dela Cruz, Gabriel', priest: 'Fr. Miguel Santos', status: 'confirmed', note: 'Godparents: Mr. and Mrs. Aquino. Family of 12 expected.' },
  { id: 10, day: 27, time: '1:30 PM', kind: 'out', type: 'Other', title: 'House blessing', who: 'Pascual household', priest: 'Fr. Miguel Santos', status: 'pending', note: 'Requested by the family. Address on file.' },
];

// Appointments shown to the signed-in parishioner (Lorenz Santiago).
export const PORTAL_APPOINTMENTS = {
  featured: {
    title: 'Baptism',
    day: 25,
    month: 'Oct',
    weekday: 'Sunday',
    time: '9:00 AM, October 25, 2026',
    place: 'St. Isidore Parish Church, main sanctuary',
    priest: 'Fr. Miguel Santos',
    people: 'Baby Gabriel Santiago and family',
    status: 'confirmed',
  },
  bring: ['Original birth certificate', "Parents' marriage certificate", "Godparents' seminar certificate"],
  others: [
    { month: 'Nov', day: '8', title: 'Pre-Cana interview', meta: '3:00 PM, Fr. Antonio Reyes', status: 'confirmed' },
    { month: 'Sep', day: '27', title: 'Confirmation rite', meta: '2:00 PM, Diocesan cathedral', status: 'completed' },
  ],
};
