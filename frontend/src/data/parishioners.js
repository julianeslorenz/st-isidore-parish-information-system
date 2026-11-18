// [baptism, first communion, confirmation, marriage] flags drive the B / C / K / M chips.
export const SACRAMENT_CHIPS = [
  { key: 'baptism', label: 'Baptism', letter: 'B' },
  { key: 'communion', label: 'First Communion', letter: 'C' },
  { key: 'confirmation', label: 'Confirmation', letter: 'K' },
  { key: 'marriage', label: 'Marriage', letter: 'M' },
];

const p = (id, name, age, zone, phone, status, flags, dates) => ({
  id, name, age, zone, phone, status,
  received: flags,
  history: [
    { sacrament: 'Baptism', date: dates[0], place: 'St. Isidore Parish Church' },
    { sacrament: 'First Communion', date: dates[1], place: 'St. Isidore Parish Church' },
    { sacrament: 'Confirmation', date: dates[2], place: 'Diocesan cathedral' },
    { sacrament: 'Marriage', date: dates[3], place: 'St. Isidore Parish Church' },
  ],
});

export const PARISHIONERS = [
  p('PAR-0001', 'Lorenz Santiago', 31, 'Zone 2', '0917 555 0142', 'active', [1, 1, 1, 0], ['Mar 9, 1995', 'Jun 14, 2002', 'Nov 22, 2009', '']),
  p('PAR-0002', 'Maria Cristina Dela Cruz', 29, 'Zone 1', '0918 555 0177', 'active', [1, 1, 1, 1], ['Jan 20, 1997', 'May 18, 2004', 'Oct 12, 2012', 'Feb 14, 2024']),
  p('PAR-0003', 'Jose Ramon Villanueva', 54, 'Zone 4', '0920 555 0123', 'active', [1, 1, 1, 1], ['Aug 3, 1972', 'May 10, 1980', 'Sep 8, 1986', 'Jun 2, 1999']),
  p('PAR-0004', 'Angelica Mae Bautista', 22, 'Zone 3', '0927 555 0190', 'active', [1, 1, 0, 0], ['Apr 14, 2004', 'May 20, 2012', '', '']),
  p('PAR-0005', 'Rogelio Santos', 67, 'Zone 5', '0935 555 0108', 'inactive', [1, 1, 1, 1], ['Feb 2, 1959', 'May 5, 1967', 'Sep 10, 1973', 'Dec 12, 1985']),
  p('PAR-0006', 'Katrina Joy Mendoza', 27, 'Zone 2', '0919 555 0166', 'active', [1, 1, 1, 0], ['Jul 7, 1999', 'May 22, 2007', 'Nov 1, 2014', '']),
  p('PAR-0007', 'Paolo Antonio Reyes', 35, 'Zone 6', '0922 555 0134', 'active', [1, 1, 1, 1], ['Oct 15, 1991', 'May 15, 1999', 'Oct 9, 2005', 'Apr 20, 2019']),
  p('PAR-0008', 'Lourdes Garcia', 72, 'Zone 1', '0915 555 0155', 'active', [1, 1, 1, 1], ['May 1, 1954', 'May 8, 1962', 'Oct 2, 1968', 'Jan 10, 1976']),
  p('PAR-0009', 'Mark Anthony Pascual', 41, 'Zone 3', '0917 555 0188', 'active', [1, 1, 0, 0], ['Dec 12, 1985', 'May 12, 1993', '', '']),
  p('PAR-0010', 'Elena Navarro', 38, 'Zone 4', '0928 555 0119', 'active', [1, 1, 1, 0], ['Sep 9, 1988', 'May 14, 1996', 'Oct 20, 2002', '']),
];

// Value of the filter select -> index into `received`
export const PARISHIONER_FILTERS = [
  { value: 'all', label: 'All sacraments' },
  { value: 'active', label: 'Active members' },
  { value: '0', label: 'Baptized' },
  { value: '2', label: 'Confirmed' },
  { value: '3', label: 'Married' },
];
