import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Award, ChevronDown, LogOut, User } from 'lucide-react';
import Logo from '../ui/Logo.jsx';
import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';
import Dropdown, { MenuDivider, MenuItem } from '../ui/Dropdown.jsx';
import NotificationsMenu from './NotificationsMenu.jsx';
import { PORTAL_LINKS } from '../../data/portalNav.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { cn } from '../../utils/cn.js';
import { firstName } from '../../utils/format.js';

export default function PortalHeader({ unreadMessages }) {
  const { parishioner, logoutParishioner } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  return (
    <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-1.5 border-b border-line bg-white px-8 max-md:px-4">
      <Link to="/portal" className="flex items-center gap-2.5 no-underline">
        <Logo size={34} />
        <div>
          <b className="block font-serif text-[17px] font-semibold leading-[1.1] text-ink">St. Isidore Parish</b>
          <small className="text-ink-3">Parishioner portal</small>
        </div>
      </Link>
      <nav aria-label="Portal" className="ml-7 flex gap-0.5 max-md:hidden">
        {PORTAL_LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => cn('flex items-center gap-[7px] rounded-lg px-[13px] py-2 font-medium no-underline hover:bg-paper', isActive ? 'bg-wine-1 text-wine' : 'text-ink-2')}
          >
            {l.label}
            {l.badgeKey === 'messages' && unreadMessages > 0 && <span className="rounded-full bg-wine px-1.5 text-[11.5px] leading-[18px] text-white">{unreadMessages}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="flex-1" />
      <NotificationsMenu />
      <Dropdown
        renderTrigger={({ triggerProps }) => (
          <Button variant="ghost" className="gap-2 px-1" aria-label="Account menu" {...triggerProps}>
            <Avatar name={parishioner.name} size={32} />
            <span className="max-md:hidden">{firstName(parishioner.name)}</span>
            <ChevronDown size={16} className="max-md:hidden" aria-hidden="true" />
          </Button>
        )}
      >
        {({ close }) => (
          <>
            <MenuItem icon={User} to="/portal/profile" onClick={close}>My profile</MenuItem>
            <MenuItem icon={Award} to="/portal/certificates" onClick={close}>Certificates</MenuItem>
            <MenuDivider />
            <MenuItem icon={LogOut} onClick={() => { close(); logoutParishioner(); toast('Signed out'); navigate('/'); }}>Sign out</MenuItem>
          </>
        )}
      </Dropdown>
    </header>
  );
}
