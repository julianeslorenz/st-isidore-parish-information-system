import { initials } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

export default function Avatar({ name, size = 36, className }) {
  return (
    <span
      className={cn('inline-flex flex-none items-center justify-center rounded-full bg-wine-2 font-semibold text-wine', className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
