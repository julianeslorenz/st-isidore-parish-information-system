import { PROTOTYPE_TODAY } from '../utils/constants.js';

// Workflow: prepared -> printed on parish paper and sent for signature -> signed and sealed -> released.
export const CERT_FLOW = ['processing', 'signature', 'ready', 'released'];

export const CERT_STEP_TEXT = {
  processing: 'Record verified and certificate prepared',
  signature: 'Printed on parish paper and sent to the parish priest for signature',
  ready: 'Signed by the parish priest and dry seal applied',
  released: 'Released to the parishioner at the parish office',
};

export const CERT_TYPES = ['Baptism', 'Confirmation', 'Marriage', 'Funeral'];
export const CERT_PREFIX = { Baptism: 'BC', Confirmation: 'CF', Marriage: 'MC', Funeral: 'FC' };

// Fields mirror the certificate facts collected by the former PHP forms.
export const CERTIFICATE_FORM_FIELDS = {
  Baptism: [
    { section: 'Baptism record', fields: [
      { key: 'baptismal_date', label: 'Date of baptism', type: 'date', required: true },
      { key: 'church', label: 'Church', required: true },
      { key: 'priest', label: 'Officiating priest' },
      { key: 'book_number', label: 'Book number' },
      { key: 'page_number', label: 'Page number' },
      { key: 'index_number', label: 'Line / index number' },
    ] },
    { section: 'Personal and family details', fields: [
      { key: 'birthday', label: 'Date of birth', type: 'date' },
      { key: 'place_of_birth', label: 'Place of birth' },
      { key: 'father_name', label: "Father's full name" },
      { key: 'mother_name', label: "Mother's full name" },
      { key: 'present_address', label: 'Present address', type: 'textarea', full: true },
      { key: 'sponsor_1', label: 'Sponsor 1' },
      { key: 'sponsor_2', label: 'Sponsor 2' },
    ] },
    { section: 'Issuance', fields: [
      { key: 'purpose', label: 'Purpose' },
      { key: 'date_issued', label: 'Date issued', type: 'date' },
    ] },
  ],
  Confirmation: [
    { section: 'Confirmation record', fields: [
      { key: 'confirmation_date', label: 'Date of confirmation', type: 'date', required: true },
      { key: 'church', label: 'Church', required: true },
      { key: 'minister', label: 'Minister' },
      { key: 'book_number', label: 'Book number' },
      { key: 'page_number', label: 'Page number' },
      { key: 'index_number', label: 'Line / index number' },
    ] },
    { section: 'Baptism and family details', fields: [
      { key: 'birthday', label: 'Date of birth', type: 'date' },
      { key: 'date_of_baptism', label: 'Date of baptism', type: 'date' },
      { key: 'place_of_baptism', label: 'Church of baptism' },
      { key: 'father_name', label: "Father's full name" },
      { key: 'mother_name', label: "Mother's full name" },
      { key: 'present_address', label: 'Present address', type: 'textarea', full: true },
      { key: 'sponsor_1', label: 'Sponsor 1' },
      { key: 'sponsor_2', label: 'Sponsor 2' },
    ] },
    { section: 'Issuance', fields: [
      { key: 'purpose', label: 'Purpose' },
      { key: 'date_issued', label: 'Date issued', type: 'date' },
    ] },
  ],
  Marriage: [
    { section: 'The couple', fields: [
      { key: 'groom_name', label: 'Groom full name', required: true },
      { key: 'bride_name', label: 'Bride full name', required: true },
      { key: 'groom_age', label: "Groom's age" },
      { key: 'bride_age', label: "Bride's age" },
      { key: 'groom_birthday', label: "Groom's date of birth", type: 'date' },
      { key: 'bride_birthday', label: "Bride's date of birth", type: 'date' },
      { key: 'groom_father_name', label: "Groom's father" },
      { key: 'groom_mother_name', label: "Groom's mother" },
      { key: 'bride_father_name', label: "Bride's father" },
      { key: 'bride_mother_name', label: "Bride's mother" },
      { key: 'groom_parent_address', label: "Groom's family address", type: 'textarea' },
      { key: 'bride_parent_address', label: "Bride's family address", type: 'textarea' },
    ] },
    { section: 'Marriage details', fields: [
      { key: 'marriage_date', label: 'Date of marriage', type: 'date', required: true },
      { key: 'marriage_place', label: 'Place of marriage', required: true },
      { key: 'priest', label: 'Officiating priest' },
      { key: 'selected_ninong', label: 'Principal sponsor (Ninong)' },
      { key: 'selected_ninang', label: 'Principal sponsor (Ninang)' },
      { key: 'marriage_license_no', label: 'Marriage license number' },
      { key: 'license_issued_at', label: 'License issued at' },
      { key: 'license_issued_on', label: 'License issued on', type: 'date' },
      { key: 'index_number', label: 'Line / index number' },
      { key: 'page_number', label: 'Page number' },
      { key: 'book_number', label: 'Book number' },
    ] },
    { section: 'Issuance', fields: [
      { key: 'purpose', label: 'Purpose' },
      { key: 'date_issued', label: 'Date issued', type: 'date' },
    ] },
  ],
  Funeral: [
    { section: 'Funeral record', fields: [
      { key: 'date_of_death', label: 'Date of death', type: 'date', required: true },
      { key: 'cause_of_death', label: 'Cause of death' },
      { key: 'informant', label: 'Informant' },
      { key: 'date_of_burial', label: 'Date of burial', type: 'date', required: true },
      { key: 'burial_place', label: 'Burial place' },
      { key: 'deceased_age', label: 'Age' },
      { key: 'civil_status', label: 'Civil status' },
      { key: 'spouse_full_name', label: 'Spouse full name' },
      { key: 'father_name', label: "Father's full name" },
      { key: 'mother_name', label: "Mother's full name" },
      { key: 'address', label: 'Last address', type: 'textarea', full: true },
      { key: 'received_sacrament', label: 'Sacraments received' },
      { key: 'officiating_priest_name', label: 'Officiating priest' },
      { key: 'additional_observations', label: 'Additional observations', type: 'textarea', full: true },
      { key: 'book_number', label: 'Book number' },
      { key: 'page_number', label: 'Page number' },
      { key: 'index_number', label: 'Line / index number' },
    ] },
    { section: 'Issuance', fields: [
      { key: 'purpose', label: 'Purpose' },
      { key: 'date_issued', label: 'Date issued', type: 'date' },
    ] },
  ],
};

// Next action per status, who may perform it, and the label of the button.
export const CERT_NEXT = {
  processing: { to: 'signature', label: 'Send for signature', permission: 'certificate.print' },
  signature: { to: 'ready', label: 'Mark as signed', permission: 'certificate.sign' },
  ready: { to: 'released', label: 'Mark as released', permission: 'certificate.release' },
};

export const CERT_STATUS_FILTERS = ['All statuses', 'Processing', 'Awaiting signature', 'Ready for release', 'Released', 'Revoked', 'Cancelled'];

export function makeCertificate(number, name, type, date, status) {
  const index = CERT_FLOW.indexOf(status);
  const steps = index < 0 ? CERT_FLOW : CERT_FLOW.slice(0, index + 1);
  const history = steps.map((step) => ({ date, text: CERT_STEP_TEXT[step] }));
  if (status === 'revoked') history.push({ date, text: 'Revoked: record under review' });
  return { number, name, type, date, status, history };
}

export const INITIAL_CERTIFICATES = [
  makeCertificate('CC-2026-0097', 'Maria Cristina Dela Cruz', 'Marriage', 'Oct 9, 2026', 'signature'),
  makeCertificate('BC-2026-0412', 'Lorenz Santiago', 'Baptism', 'Oct 8, 2026', 'ready'),
  makeCertificate('CF-2026-0088', 'Katrina Joy Mendoza', 'Confirmation', 'Oct 7, 2026', 'released'),
  makeCertificate('BC-2026-0411', 'Elena Navarro', 'Baptism', 'Oct 5, 2026', 'released'),
  makeCertificate('MC-2026-0031', 'Paolo Antonio Reyes', 'Marriage', 'Oct 2, 2026', 'processing'),
  makeCertificate('CF-2026-0087', 'Lorenz Santiago', 'Confirmation', 'Sep 28, 2026', 'signature'),
  makeCertificate('BC-2026-0405', 'Angelica Mae Bautista', 'Baptism', 'Sep 24, 2026', 'released'),
  makeCertificate('FC-2026-0019', 'Garcia family', 'Funeral', 'Sep 20, 2026', 'revoked'),
];

export const nextCertificateNumber = (type, count) => `${CERT_PREFIX[type]}-2026-0${413 + count}`;
export const certificateStamp = PROTOTYPE_TODAY.stamp;

// ---- Parishioner-facing wording. Parishioners only ever see STATUS, never a file. ----
export const PORTAL_CERT_LABELS = {
  processing: 'Processing',
  signature: 'Awaiting priest signature',
  ready: 'Ready for pickup',
  released: 'Released',
  revoked: 'Revoked',
  cancelled: 'Cancelled',
};

export const PORTAL_CERT_MESSAGES = {
  processing: 'The parish office is preparing your certificate.',
  signature: 'Your certificate is printed and waiting for the parish priest to sign it.',
  ready: 'Signed and sealed. Please come to the parish office to pick it up.',
  released: 'You received this certificate from the parish office.',
  revoked: 'This certificate is no longer valid. Please contact the parish office.',
  cancelled: 'This certificate request was cancelled. Contact the parish office if you still need it.',
};

export const PORTAL_CERT_STEPS = ['Processing', 'Signature', 'Ready', 'Released'];
export const PORTAL_CERT_TYPES = ['Baptism', 'Confirmation', 'Marriage', 'Funeral'];
