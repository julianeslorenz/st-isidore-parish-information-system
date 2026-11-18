import { NavLink } from 'react-router-dom';
import Logo from '../ui/Logo.jsx';
import Avatar from '../ui/Avatar.jsx';
import { cn } from '../../utils/cn.js';

const linkBase = 'relative flex items-center gap-[11px] rounded-lg px-3 py-[9px] font-medium text-[#E7D6D9] no-underline hover:bg-white/[.07]';
const linkActive = 'bg-white/[.12] !text-white before:absolute before:-left-3 before:inset-y-2 before:w-[3px] before:rounded-r-[3px] before:bg-gold before:content-[""]';

/** Dark wine admin sidebar: fixed on desktop, slide-in drawer on small screens. */
export default function Sidebar({ screens, account, open, onNavigate }) {
  const groups = screens.reduce((acc, s) => {
    (acc[s.group] ||= []).push(s);
    return acc;
  }, {});

  return (
    <aside
      aria-label="Administration"
      className={cn(
        'z-20 flex w-[252px] flex-none flex-col overflow-auto bg-wine-9 px-3 pb-3.5 pt-[18px] text-[#E7D6D9]',
        'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:shadow-[8px_0_30px_rgba(0,0,0,.3)] max-md:transition-[transform,visibility] max-md:duration-200',
        open ? '' : 'max-md:invisible max-md:-translate-x-[102%]',
      )}
    >
      <div className="flex items-center gap-2.5 px-2 pb-[18px] pt-1">
        <Logo size={38} variant="light" />
        <div>
          <b className="block font-serif text-[17px] font-semibold leading-[1.1] text-white">St. Isidore</b>
          <small className="text-[11.5px] text-[#C9B0B5]">Parish Information System</small>
        </div>
      </div>

      <nav aria-label="Main" className="mb-3.5 flex flex-col gap-0.5">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="flex flex-col gap-0.5">
            <div className="px-3 pb-1 pt-2.5 text-xs font-medium text-[#B79AA0]">{group}</div>
            {items.map((s) => (
              <NavLink key={s.key} to={s.to} onClick={onNavigate} className={({ isActive }) => cn(linkBase, isActive && linkActive)}>
                <s.icon size={19} aria-hidden="true" />
                {s.label}
                {s.badge && <span className="ml-auto rounded-full bg-gold px-[7px] text-[11.5px] font-semibold leading-[18px] text-gold-ink">{s.badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 border-t border-white/[.12] px-2 pt-3">
        <Avatar name={account.name} size={36} />
        <div>
          <b className="block text-[13px] font-medium text-white">{account.name}</b>
          <small className="text-xs text-[#C9B0B5]">{account.role}</small>
        </div>
      </div>
    </aside>
  );
}
