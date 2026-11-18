// Initials use only capitalised words, so "Fr. Antonio Reyes" becomes "FA" like the prototype.
export const initials = (name = '') =>
  name
    .split(' ')
    .filter((word) => /^[A-Z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join('');

export const nowTime = () =>
  new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export const isEmail = (value = '') => /^\S+@\S+\.\S+$/.test(value.trim());

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-11-01" -> "Nov 1, 2026" (no timezone surprises: parsed manually)
export const formatIsoDate = (iso) => {
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  return `${MONTHS_SHORT[month - 1]} ${day}, ${year}`;
};

// Compact label used on calendar pills: "9:00 AM" -> "9am"
export const pillTime = (time) => time.replace(':00', '').replace(' ', '').toLowerCase();

export const firstName = (name = '') => name.split(' ')[0];
