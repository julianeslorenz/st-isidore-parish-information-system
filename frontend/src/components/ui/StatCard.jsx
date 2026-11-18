import { cn } from '../../utils/cn.js';
import { Card } from './Card.jsx';

/** KPI tile (prototype .stat). Pass `onClick` to make the whole tile a button. */
export default function StatCard({ icon: Icon, value, label, detail, tone, onClick, active }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Card
      as={Wrapper}
      {...(onClick ? { onClick, type: 'button', 'aria-pressed': active } : {})}
      className={cn('flex items-start gap-3.5 px-5 py-[18px] text-left max-sm:flex-col max-sm:gap-2.5 max-sm:p-3.5', onClick && 'cursor-pointer hover:border-wine-2', active && 'border-wine')}
    >
      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] bg-wine-1 text-wine">
        <Icon size={21} aria-hidden="true" />
      </div>
      <div>
        <div className="font-serif text-[30px] font-semibold leading-[1.1] tabular-nums max-sm:text-[26px]">{value}</div>
        <div className="text-[13px] text-ink-2">{label}</div>
        {detail && <div className={cn('mt-1 text-[12.5px]', tone === 'warn' ? 'text-warn' : 'text-ok')}>{detail}</div>}
      </div>
    </Card>
  );
}
