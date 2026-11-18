import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../ui/Logo.jsx';
import Button from '../ui/Button.jsx';
import IconButton from '../ui/IconButton.jsx';
import { PUBLIC_NAV } from '../../data/parish.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn } from '../../utils/cn.js';

const linkClass = ({ isActive }) => cn('whitespace-nowrap rounded-lg px-2.5 py-2 font-medium no-underline hover:bg-paper', isActive ? 'bg-wine-1 text-wine' : 'text-ink-2');

export default function PublicHeader() {
  const { parishioner } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const actions = parishioner ? (
    <Button to="/portal" className="flex-1">Go to my portal</Button>
  ) : (
    <>
      <Button to="/login" variant="secondary" className="flex-1">Login</Button>
      <Button to="/register" className="flex-1">Create account</Button>
    </>
  );

  return (
    <header className="no-print sticky top-0 z-30 border-b border-line bg-white">
      <div className="relative flex h-[68px] items-center gap-1.5 px-8 max-md:px-4">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <Logo size={36} />
          <div>
            <b className="block font-serif text-lg font-semibold leading-[1.1] text-ink">St. Isidore Parish</b>
            <small className="text-ink-3">Official parish portal</small>
          </div>
        </Link>
        <nav aria-label="Main" className="ml-[18px] flex gap-0.5 max-md:hidden">
          {PUBLIC_NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>{n.label}</NavLink>)}
        </nav>
        <div className="flex-1" />
        <div className="flex gap-2 max-md:hidden">{parishioner ? <Button to="/portal">Go to my portal</Button> : <><Button to="/login" variant="secondary">Login</Button><Button to="/register">Create account</Button></>}</div>
        <IconButton label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} className="md:hidden" onClick={() => setOpen((v) => !v)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </IconButton>
      </div>
      {open && (
        <div className="flex flex-col border-t border-line bg-white px-4 pb-4 pt-2 shadow-[0_12px_24px_rgba(0,0,0,.14)] md:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {PUBLIC_NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cn('rounded-lg p-3 font-medium no-underline', isActive ? 'bg-wine-1 text-wine' : 'text-ink')}>{n.label}</NavLink>
            ))}
          </nav>
          <div className="flex gap-2 pt-2.5">{actions}</div>
        </div>
      )}
    </header>
  );
}
