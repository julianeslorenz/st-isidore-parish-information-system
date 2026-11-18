import { Bell, Check } from 'lucide-react';
import Dropdown, { MenuDivider, MenuItem } from '../ui/Dropdown.jsx';
import IconButton from '../ui/IconButton.jsx';
import { NOTIFICATIONS } from '../../data/parish.js';
import { useToast } from '../../context/ToastContext.jsx';

/** Bell button + notification list, shared by the admin and parishioner headers. */
export default function NotificationsMenu() {
  const toast = useToast();
  return (
    <Dropdown
      menuClassName="w-[320px] max-w-[92vw]"
      renderTrigger={({ triggerProps }) => (
        <IconButton label="Notifications" className="relative" {...triggerProps}>
          <Bell size={20} />
          <i className="absolute right-2 top-[7px] h-2 w-2 rounded-full border-2 border-white bg-gold" aria-hidden="true" />
        </IconButton>
      )}
    >
      {({ close }) => (
        <div>
          <div className="px-2.5 pb-1 pt-2 font-semibold">Notifications</div>
          {NOTIFICATIONS.map((n) => (
            <div key={n.id} className="flex gap-2.5 rounded-lg p-2.5 hover:bg-paper">
              {n.unread ? <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-gold" aria-label="Unread" /> : <span className="w-2 flex-none" />}
              <p className="text-[13px] leading-[1.4]">{n.text}<br /><small className="text-ink-3">{n.when}</small></p>
            </div>
          ))}
          <MenuDivider />
          <MenuItem icon={Check} onClick={() => { toast('All notifications marked as read'); close(); }}>Mark all as read</MenuItem>
        </div>
      )}
    </Dropdown>
  );
}
