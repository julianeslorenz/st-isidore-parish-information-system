import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import Dropdown, { MenuDivider, MenuItem } from '../ui/Dropdown.jsx';
import IconButton from '../ui/IconButton.jsx';
import { useData } from '../../context/DataContext.jsx';

const READ_KEY = 'st-isidore-notifications-read';
const readIds = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
};
const timeLabel = (value) => {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};
const latest = (items, dateKey) => [...(items || [])].sort((a, b) => new Date(b[dateKey] || 0) - new Date(a[dateKey] || 0))[0];

/** Live, role-specific notifications shared by the admin and parishioner headers. */
export default function NotificationsMenu() {
  const data = useData();
  const navigate = useNavigate();
  const isStaff = ['Admin', 'Parish Secretary', 'Parish Staff', 'Priest'].includes(data.account?.role);
  const storageKey = `${READ_KEY}:${data.account?.id || data.account?.role || 'guest'}`;
  const [read, setRead] = useState(() => readIds(storageKey));
  useEffect(() => setRead(readIds(storageKey)), [storageKey]);
  const notifications = useMemo(() => {
    const items = [];
    if (isStaff) {
      for (const request of data.requests) {
        if (!['pending', 'under_review'].includes(request.status)) continue;
        const stamp = request.submitted || request.timeline?.at(-1)?.when;
        items.push({ id: `request:${request.id}:${stamp || request.status}`, text: `New ${request.type} request from ${request.applicant || request.forWhom}`, when: stamp, to: `/admin/requests/${encodeURIComponent(request.id)}` });
      }
      for (const certificate of data.certificates) {
        if (!['processing', 'ready'].includes(certificate.status)) continue;
        const event = latest(certificate.history, 'date');
        const stamp = event?.date || certificate.date;
        items.push({ id: `certificate:${certificate.id}:${stamp || certificate.status}`, text: certificate.status === 'processing' ? `${certificate.type} certificate for ${certificate.name} needs preparation` : `${certificate.type} certificate for ${certificate.name} is ready for pickup`, when: stamp, to: `/admin/certificates?certificateId=${certificate.id}` });
      }
      for (const conversation of data.adminConversations) {
        if (!(conversation.unread > 0) || conversation.archived) continue;
        const message = latest(conversation.messages?.filter((m) => m.from === 'in'), 'createdAt') || conversation.messages?.filter((m) => m.from === 'in').at(-1);
        items.push({ id: `message:${conversation.id}:${message?.createdAt || message?.time || conversation.unread}`, text: `New message from ${conversation.name}`, when: message?.createdAt || message?.time, to: `/admin/messages?conversationId=${conversation.id}`, peerId: conversation.id });
      }
      for (const appointment of data.appointments) {
        const reschedule = appointment.details?.reschedule_request;
        if (appointment.status === 'pending') items.push({ id: `appointment:${appointment.id}:${appointment.status}`, text: `${appointment.type} appointment request needs review`, when: appointment.created_at || appointment.start_at, to: '/admin/appointments', appointmentId: appointment.id });
        if (reschedule?.status === 'pending') items.push({ id: `reschedule:${appointment.id}:${reschedule.created_at}`, text: `${appointment.type} appointment reschedule request from ${appointment.who || 'a parishioner'}`, when: reschedule.created_at, to: '/admin/appointments', appointmentId: appointment.id });
      }
    } else {
      for (const request of data.myRequests) {
        const event = latest(request.timeline, 'when');
        if (!event || /request (received|submitted)/i.test(event.text || '')) continue;
        const stamp = event.when || request.submitted;
        items.push({ id: `request:${request.id}:${stamp || request.status}`, text: `${request.type} request for ${request.forWhom}: ${event.text || request.status.replaceAll('_', ' ')}`, when: stamp, to: `/portal/requests?requestId=${encodeURIComponent(request.id)}` });
      }
      for (const certificate of data.certificates) {
        if (certificate.status !== 'ready') continue;
        const event = latest(certificate.history, 'date');
        const stamp = event?.date || certificate.date;
        items.push({ id: `certificate:${certificate.id}:${stamp || certificate.status}`, text: `${certificate.type} certificate for ${certificate.name} is ready for pickup`, when: stamp, to: `/portal/certificates?certificateId=${certificate.id}` });
      }
      for (const appointment of data.appointments) {
        if (!['confirmed', 'cancelled'].includes(appointment.status)) continue;
        items.push({ id: `appointment:${appointment.id}:${appointment.status}`, text: `${appointment.type} appointment ${appointment.status}`, when: appointment.start_at, to: '/portal/appointments', appointmentId: appointment.id });
      }
      for (const conversation of data.userConversations) {
        if (!(conversation.unread > 0)) continue;
        const message = latest(conversation.messages?.filter((m) => m.from === 'in'), 'createdAt') || conversation.messages?.filter((m) => m.from === 'in').at(-1);
        items.push({ id: `message:${conversation.id}:${message?.createdAt || message?.time || conversation.unread}`, text: `New message from ${conversation.name}`, when: message?.createdAt || message?.time, to: `/portal/messages?conversationId=${conversation.id}`, peerId: conversation.id });
      }
    }
    return items.sort((a, b) => new Date(b.when || 0) - new Date(a.when || 0)).slice(0, 12);
  }, [data, isStaff]);

  const unread = notifications.filter((item) => !read.includes(item.id));
  const markRead = (item) => {
    const next = [...new Set([...read, item.id])];
    setRead(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };
  const openNotification = (item, close) => {
    markRead(item);
    if (item.peerId != null) {
      const markConversationRead = isStaff ? data.openAdminConversation : data.markUserConversationRead;
      markConversationRead(item.peerId);
    }
    close();
    navigate(item.to, item.appointmentId ? { state: { select: item.appointmentId } } : undefined);
  };
  const markAllRead = () => {
    const next = [...new Set([...read, ...notifications.map((item) => item.id)])];
    setRead(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    const markConversationRead = isStaff ? data.openAdminConversation : data.markUserConversationRead;
    notifications.filter((item) => item.peerId != null).forEach((item) => markConversationRead(item.peerId));
  };

  return (
    <Dropdown
      menuClassName="w-[340px] max-w-[92vw]"
      renderTrigger={({ triggerProps }) => (
        <IconButton label="Notifications" className="relative" {...triggerProps}>
          <Bell size={20} />
          {unread.length > 0 && <i className="absolute right-2 top-[7px] h-2 w-2 rounded-full border-2 border-white bg-gold" aria-hidden="true" />}
        </IconButton>
      )}
    >
      {({ close }) => (
        <div>
          <div className="flex items-center px-2.5 pb-1 pt-2 font-semibold"><span>Notifications</span><span className="ml-auto text-xs font-normal text-ink-3">{unread.length} unread</span></div>
          {notifications.length ? notifications.map((item) => (
            <button key={item.id} type="button" onClick={() => openNotification(item, close)} className="flex w-full gap-2.5 rounded-lg border-0 bg-transparent p-2.5 text-left hover:bg-paper">
              {!read.includes(item.id) ? <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-gold" aria-label="Unread" /> : <span className="w-2 flex-none" />}
              <span className="text-[13px] leading-[1.4]">{item.text}<br /><small className="text-ink-3">{timeLabel(item.when)}</small></span>
            </button>
          )) : <p className="px-2.5 py-5 text-center text-sm text-ink-3">No new notifications.</p>}
          {notifications.length > 0 && <><MenuDivider /><MenuItem icon={Check} onClick={() => { markAllRead(); close(); }}>Mark all as read</MenuItem></>}
        </div>
      )}
    </Dropdown>
  );
}
