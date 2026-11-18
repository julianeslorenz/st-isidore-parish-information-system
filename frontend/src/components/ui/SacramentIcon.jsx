import { SACRAMENT_ICONS } from '../../utils/icons.js';
import { cn } from '../../utils/cn.js';

/** Rounded wine tile with the sacrament's icon (prototype .ri / sIcon). */
export default function SacramentIcon({ name, size = 44, active = false, className }) {
  const Icon = SACRAMENT_ICONS[name];
  return (
    <div
      className={cn('flex flex-none items-center justify-center rounded-xl', active ? 'bg-wine text-white' : 'bg-wine-1 text-wine', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {Icon && <Icon size={Math.round(size / 2)} />}
    </div>
  );
}
