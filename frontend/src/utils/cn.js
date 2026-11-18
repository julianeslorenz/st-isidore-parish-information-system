// Tiny className joiner (no dependency needed).
export const cn = (...parts) => parts.flat(Infinity).filter(Boolean).join(' ');
