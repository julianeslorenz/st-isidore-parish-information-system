// Field names follow the legacy ChurchInfoSystem sacramental register tables.
// Values are stored in ParishRecord.details so older generic records remain readable.
const register = (fields) => [
  { section: 'Register reference', fields: [
    { key: 'index_number', label: 'Index number', type: 'number' },
    { key: 'book_number', label: 'Book number', type: 'number' },
    { key: 'page_number', label: 'Page number', type: 'number' },
  ] },
  ...fields,
];

export const SACRAMENTAL_RECORD_FIELDS = {
  Baptism: register([
    { section: 'Baptism details', fields: [
      { key: 'name', label: 'Name of baptized person', full: true },
      { key: 'baptismal_date', label: 'Baptism date', type: 'date' },
      { key: 'birthday', label: 'Date of birth', type: 'date' },
      { key: 'place_of_birth', label: 'Place of birth' },
      { key: 'legitimacy', label: 'Legitimacy', type: 'select', options: ['CATH', 'CIV', 'PROT', 'AGL', 'NAT'] },
    ] },
    { section: 'Parents', fields: [
      { key: 'mother_name', label: "Mother's name" },
      { key: 'mother_place_of_birth', label: "Mother's place of birth" },
      { key: 'mother_present_address', label: "Mother's present address", full: true },
      { key: 'father_name', label: "Father's name" },
      { key: 'father_place_of_birth', label: "Father's place of birth" },
      { key: 'father_present_address', label: "Father's present address", full: true },
    ] },
    { section: 'Sponsors and parish entry', fields: [
      { key: 'sponsor_1', label: 'Sponsor 1' }, { key: 'S1_address', label: 'Sponsor 1 address' },
      { key: 'sponsor_2', label: 'Sponsor 2' }, { key: 'S2_address', label: 'Sponsor 2 address' },
      { key: 'stipendium_amount', label: 'Stipendium amount' }, { key: 'priest_name', label: 'Priest name' },
      { key: 'purpose', label: 'Purpose', type: 'textarea', full: true },
    ] },
  ]),
  Confirmation: register([
    { section: 'Confirmation details', fields: [
      { key: 'name', label: 'Name of confirmed person', full: true },
      { key: 'confirmation_date', label: 'Confirmation date', type: 'date' },
      { key: 'age', label: 'Age', type: 'number' }, { key: 'parish', label: 'Parish' },
      { key: 'address', label: 'Address', full: true },
      { key: 'date_of_baptism', label: 'Date of baptism', type: 'date' },
      { key: 'place_of_baptism', label: 'Place of baptism' },
      { key: 'church', label: 'Church of confirmation', full: true },
    ] },
    { section: 'Parents and sponsors', fields: [
      { key: 'mother_name', label: "Mother's name" }, { key: 'father_name', label: "Father's name" },
      { key: 'sponsor_1', label: 'Sponsor 1' }, { key: 'sponsor_2', label: 'Sponsor 2' },
      { key: 'minister', label: 'Minister' }, { key: 'purpose', label: 'Purpose' },
    ] },
  ]),
  Marriage: register([
    { section: 'Groom', fields: [
      { key: 'groom_name', label: "Groom's full name", full: true },
      { key: 'groom_civil_status', label: 'Civil status', type: 'select', options: ['Single', 'Widowed', 'Legally Separated'] },
      { key: 'groom_age', label: 'Age', type: 'number' }, { key: 'groom_birthday', label: 'Date of birth', type: 'date' },
      { key: 'groom_place_of_birth', label: 'Place of birth' }, { key: 'groom_address', label: 'Address', full: true },
      { key: 'groom_father_name', label: "Father's name" }, { key: 'groom_mother_name', label: "Mother's name" },
      { key: 'groom_parent_address', label: "Parents' address", full: true },
    ] },
    { section: 'Bride', fields: [
      { key: 'bride_name', label: "Bride's full name", full: true },
      { key: 'bride_civil_status', label: 'Civil status', type: 'select', options: ['Single', 'Widowed', 'Legally Separated'] },
      { key: 'bride_age', label: 'Age', type: 'number' }, { key: 'bride_birthday', label: 'Date of birth', type: 'date' },
      { key: 'bride_place_of_birth', label: 'Place of birth' }, { key: 'bride_address', label: 'Address', full: true },
      { key: 'bride_father_name', label: "Father's name" }, { key: 'bride_mother_name', label: "Mother's name" },
      { key: 'bride_parent_address', label: "Parents' address", full: true },
    ] },
    { section: 'Marriage details', fields: [
      { key: 'marriage_date', label: 'Marriage date', type: 'date' }, { key: 'marriage_place', label: 'Marriage place' },
      { key: 'officiating_priest', label: 'Officiating priest', full: true },
    ] },
    { section: 'Sponsors', fields: Array.from({ length: 4 }, (_, i) => i + 1).flatMap((i) => [
      { key: `ninang_${i}`, label: `Ninang ${i}` }, { key: `ninang_${i}_address`, label: `Ninang ${i} address` },
      { key: `ninong_${i}`, label: `Ninong ${i}` }, { key: `ninong_${i}_address`, label: `Ninong ${i} address` },
    ]) },
    { section: 'License and notes', fields: [
      { key: 'marriage_license_no', label: 'Marriage license number' },
      { key: 'license_issued_at', label: 'License issued at' },
      { key: 'license_issued_on', label: 'License issued on', type: 'date' },
      { key: 'pesos', label: 'Pesos', type: 'number' }, { key: 'cts', label: 'Centavos', type: 'number' },
      { key: 'observanda', label: 'Observanda', type: 'textarea', full: true },
      { key: 'purpose', label: 'Purpose', type: 'textarea', full: true },
    ] },
  ]),
  Funeral: register([
    { section: 'Funeral details', fields: [
      { key: 'deceased_full_name', label: 'Name of deceased', full: true },
      { key: 'date_of_death', label: 'Date of death', type: 'date' },
      { key: 'date_of_burial', label: 'Date of burial', type: 'date' },
      { key: 'deceased_age', label: 'Age', type: 'number' },
      { key: 'civil_status', label: 'Civil status', type: 'select', options: ['Single', 'Married', 'Widow', 'Widower'] },
      { key: 'deceased_address', label: 'Address', type: 'textarea', full: true },
      { key: 'received_sacrament', label: 'Received sacraments', type: 'select', options: [{ value: 'UI', label: 'Yes (UI)' }, { value: 'NON', label: 'No (NON)' }] },
      { key: 'cause_of_death', label: 'Cause of death' },
      { key: 'burial_place', label: 'Burial place' }, { key: 'class_of_service', label: 'Class of service' },
    ] },
    { section: 'Family and parish entry', fields: [
      { key: 'mother_full_name', label: "Mother's full name" }, { key: 'father_full_name', label: "Father's full name" },
      { key: 'spouse_full_name', label: "Spouse's full name" }, { key: 'officiating_priest_name', label: 'Officiating priest' },
      { key: 'pesos', label: 'Pesos', type: 'number' }, { key: 'cts', label: 'Centavos', type: 'number' },
      { key: 'additional_observations', label: 'Additional observations', type: 'textarea', full: true },
      { key: 'purpose', label: 'Purpose', type: 'textarea', full: true },
    ] },
  ]),
};

export const RECORD_PERSON_FIELD = { Baptism: 'name', Confirmation: 'name', Marriage: null, Funeral: 'deceased_full_name' };
export const RECORD_DATE_FIELD = { Baptism: 'baptismal_date', Confirmation: 'confirmation_date', Marriage: 'marriage_date', Funeral: 'date_of_burial' };
