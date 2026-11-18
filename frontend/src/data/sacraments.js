// Sacraments offered by the parish. The prototype only defines these four.
export const SACRAMENTS = {
  Baptism: {
    description: 'For infants and children under 7 years old.',
    documents: ['Birth certificate of the child', "Parents' marriage certificate", 'Valid ID of a parent', "Godparents' seminar certificate"],
    detailTitle: 'Child details',
    fields: [
      { key: 'cn', label: "Child's full name" },
      { key: 'cb', label: 'Date of birth', type: 'date' },
      { key: 'fa', label: "Father's name" },
      { key: 'mo', label: "Mother's name" },
    ],
    process: ['Pre-baptism seminar for parents and godparents', 'Baptism rite with the priest', 'Certificate prepared by the parish office'],
    reminder: 'Bring original documents on the day. Godparents should attend the seminar.',
  },
  Marriage: {
    description: 'For couples planning a church wedding.',
    documents: ['Baptismal certificate (recent copy)', 'Confirmation certificate', 'Marriage license or CENOMAR', 'Pre-Cana seminar certificate'],
    detailTitle: 'Couple details',
    fields: [
      { key: 'cn', label: "Groom's full name" },
      { key: 'cb2', label: "Bride's full name" },
      { key: 'fa', label: 'Civil status of both' },
      { key: 'mo', label: 'Planned guests' },
    ],
    process: ['Interview with the priest', 'Pre-Cana seminar', 'Rehearsal and wedding ceremony'],
    reminder: 'Apply early. Both partners must attend the Pre-Cana seminar.',
  },
  Confirmation: {
    description: 'For baptized Catholics who are ready to be confirmed.',
    documents: ['Baptismal certificate', 'Sponsor details', 'Seminar attendance sheet', 'Valid ID'],
    detailTitle: 'Candidate details',
    fields: [
      { key: 'cn', label: "Candidate's full name" },
      { key: 'cb', label: 'Date of birth', type: 'date' },
      { key: 'fa', label: "Sponsor's name" },
      { key: 'mo', label: 'Parish of baptism' },
    ],
    process: ['Document verification', 'Confirmation seminar', 'Confirmation rite'],
    reminder: 'Candidates should attend every seminar session and bring a sponsor.',
  },
  Funeral: {
    description: 'For funeral Mass and rites for a loved one.',
    documents: ['Death certificate', 'Valid ID of requester', 'Burial permit'],
    detailTitle: 'Details of the deceased',
    fields: [
      { key: 'cn', label: 'Full name of the deceased' },
      { key: 'cb', label: 'Date of passing', type: 'date' },
      { key: 'fa', label: 'Preferred cemetery' },
      { key: 'mo', label: 'Relationship to the deceased' },
    ],
    process: ['Meeting with the priest', 'Funeral Mass planning', 'Funeral Mass and rites'],
    reminder: 'Contact the parish office as soon as possible so the Mass time can be set.',
  },
};

export const SACRAMENT_NAMES = Object.keys(SACRAMENTS);

// Date/time choices offered in step 3 of the request wizard.
const scheduleDates = () => {
  const dates = [];
  const day = new Date(); day.setHours(0, 0, 0, 0);
  while (dates.length < 6) {
    day.setDate(day.getDate() + 1);
    if (day.getDay() === 0 || day.getDay() === 6) dates.push(`${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`);
  }
  return dates;
};
export const WIZARD_DATES = scheduleDates();
export const WIZARD_TIMES = ['8:00 AM', '9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM'];
export const WIZARD_BOOKED_TIMES = [];
export const WIZARD_STEPS = ['Select service', 'Applicant', 'Schedule', 'Documents', 'Review', 'Submit'];
