import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Home, LogOut, Menu, User } from 'lucide-react';
import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';
import IconButton from '../ui/IconButton.jsx';
import Dropdown, { MenuDivider, MenuItem } from '../ui/Dropdown.jsx';
import SearchBar from '../ui/SearchBar.jsx';
import NotificationsMenu from './NotificationsMenu.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminTopbar({ account, title, crumb, onMenu, searchTarget }) {
  const navigate = useNavigate();
  const { logoutAdmin, parishioner } = useAuth();
  const [query, setQuery] = useState('');

  const submitSearch = (event) => {
    event.preventDefault();
    if (searchTarget) navigate(`${searchTarget}?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="no-print flex h-16 flex-none items-center gap-3 border-b border-line bg-white px-6 max-md:px-3.5">
      <IconButton label="Open menu" className="md:hidden" onClick={onMenu}><Menu size={20} /></IconButton>
      <div>
        <span className="block text-[12.5px] leading-[1.2] text-ink-3">{crumb}</span>
        <span className="font-serif text-lg font-semibold">{title}</span>
      </div>
      <div className="flex-1" />
      {searchTarget && (
        <form onSubmit={submitSearch} role="search" className="max-md:hidden">
          <SearchBar value={query} onChange={setQuery} placeholder="Search parishioners, requests…" className="w-[280px] max-lg:w-[200px]" />
        </form>
      )}
      <NotificationsMenu />
      <Dropdown
        renderTrigger={({ triggerProps }) => (
          <Button variant="ghost" className="gap-2 px-1" aria-label="Account menu" {...triggerProps}>
            <Avatar name={account.name} size={32} />
            <ChevronDown size={16} className="max-md:hidden" aria-hidden="true" />
          </Button>
        )}
      >
        {({ close }) => (
          <>
            <div className="px-2.5 py-2">
              <b>{account.name}</b><br />
              <span className="text-[12.5px] text-ink-3">{account.email}</span>
              <div className="mt-0.5 text-[12.5px] text-ink-2">{account.role}</div>
            </div>
            <MenuDivider />
            <MenuItem icon={User} to="/admin/profile" onClick={close}>My account</MenuItem>
            <MenuItem icon={Home} to={parishioner ? '/portal' : '/login'} onClick={close}>Open parishioner portal</MenuItem>
            <MenuDivider />
            <MenuItem icon={LogOut} onClick={() => { close(); logoutAdmin(); navigate('/admin/login'); }}>Sign out</MenuItem>
          </>
        )}
      </Dropdown>
    </header>
  );
}
