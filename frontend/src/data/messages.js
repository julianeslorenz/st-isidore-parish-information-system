// Message direction: "in" arrives from the other side, "out" is sent by the signed-in person.
export const USER_CONVERSATIONS = [
  { id: 1, name: 'Parish Office', unread: 2, archived: false, messages: [
    { from: 'in', text: 'Good afternoon, Lorenz. We received your baptism request BR-2026-001.', time: 'Oct 10, 3:12 PM' },
    { from: 'out', text: 'Thank you! Do we need to bring the original birth certificate?', time: 'Oct 10, 3:40 PM' },
    { from: 'in', text: 'Yes, please bring the original and one photocopy to the pre-baptism seminar.', time: 'Today, 9:02 AM' },
    { from: 'in', text: 'The seminar is on Oct 18 after the 8:00 AM Mass. Godparents should attend as well.', time: 'Today, 9:03 AM' },
  ] },
  { id: 2, name: 'Fr. Antonio Reyes', unread: 1, archived: false, messages: [
    { from: 'in', text: 'Your marriage request has been approved. Let us schedule your Pre-Cana interview.', time: 'Yesterday, 4:10 PM' },
  ] },
  { id: 3, name: 'Baptism Ministry', unread: 1, archived: false, messages: [
    { from: 'in', text: 'Reminder: both godparents are asked to attend the seminar.', time: 'Yesterday, 10:00 AM' },
  ] },
  { id: 4, name: 'Parish Announcements', unread: 0, archived: false, messages: [
    { from: 'in', text: 'The Parish Feast schedule for Oct 20 has been posted.', time: 'Oct 9, 8:00 AM' },
  ] },
];

export const AUTO_REPLY = 'Thank you for your message. A member of the parish office will reply shortly.';

export const ADMIN_CONVERSATIONS = [
  { id: 1, name: 'Maria Cristina Dela Cruz', unread: 2, archived: false, messages: [
    { from: 'in', text: 'Good morning! Is the Oct 18 seminar required for both godparents?', time: 'Oct 12, 9:14 AM' },
    { from: 'in', text: 'Can we bring the documents on the seminar day?', time: 'Oct 12, 9:15 AM' },
  ] },
  { id: 2, name: 'Jose Ramon Villanueva', unread: 1, archived: false, messages: [
    { from: 'in', text: 'May we move the Oct 24 rehearsal to 5:00 PM?', time: 'Oct 12, 8:02 AM' },
  ] },
  { id: 3, name: 'Katrina Joy Mendoza', unread: 0, archived: false, messages: [
    { from: 'in', text: 'Thank you for the confirmation certificate update.', time: 'Oct 10, 2:20 PM' },
    { from: 'out', text: 'You are welcome. It is signed and ready for pickup.', time: 'Oct 10, 2:41 PM' },
  ] },
  { id: 4, name: 'Garcia family', unread: 0, archived: true, messages: [
    { from: 'in', text: 'Thank you, Father, for the funeral arrangements.', time: 'Oct 1, 4:10 PM' },
  ] },
];
