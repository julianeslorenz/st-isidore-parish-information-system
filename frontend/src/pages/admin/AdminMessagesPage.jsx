import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, Plus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import SearchBar from '../../components/ui/SearchBar.jsx';
import { SelectField, TextareaField } from '../../components/ui/Field.jsx';
import { Composer, ConversationItem, MessageThread, MessagingLayout } from '../../components/common/Messaging.jsx';
import { usePageMeta } from '../../context/AdminShellContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { firstName } from '../../utils/format.js';

const FILTERS = [['inbox', 'Inbox'], ['unread', 'Unread'], ['archived', 'Archived']];

function ComposeModal({ parishioners, initialTo, onClose, onSend }) {
  const [to, setTo] = useState(initialTo ?? parishioners[0]?.name ?? '');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  return (
    <Modal open onClose={onClose} title="New message" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => (text.trim() ? onSend(to, text.trim()) : setError('Write a message before sending.'))}>Send</Button></>}>
      <div className="flex flex-col gap-3.5">
        <SelectField label="To" value={to} onChange={(e) => setTo(e.target.value)} options={parishioners.map((p) => p.name)} />
        <TextareaField label="Message" placeholder="Write your message" value={text} onChange={(e) => setText(e.target.value)} error={error} />
      </div>
    </Modal>
  );
}

export default function AdminMessagesPage() {
  usePageMeta('Messages', 'Communication');
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { adminConversations, parishioners, openAdminConversation, sendAdminMessage, toggleAdminUnread, toggleAdminArchive, composeAdminMessage } = useData();
  const [filter, setFilter] = useState('inbox');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(adminConversations[0]?.id ?? null);
  const [threadOpen, setThreadOpen] = useState(false);
  const [composeTo, setComposeTo] = useState(location.state?.compose ?? null);
  const [composing, setComposing] = useState(!!location.state?.compose);

  useEffect(() => {
    const requestedId = Number(new URLSearchParams(location.search).get('conversationId'));
    if (requestedId && adminConversations.some((conversation) => conversation.id === requestedId)) {
      setFilter('inbox');
      setThreadOpen(true);
      if (activeId !== requestedId) {
        setActiveId(requestedId);
        openAdminConversation(requestedId);
      }
      navigate(location.pathname, { replace: true, state: location.state });
    }
  }, [location.search, location.pathname, location.state, adminConversations, activeId, openAdminConversation, navigate]);

  // "Message" on a parishioner profile opens the composer once; drop the router state afterwards.
  useEffect(() => { if (location.state?.compose) navigate(location.pathname, { replace: true, state: null }); }, [location, navigate]);

  const visible = useMemo(() => adminConversations.filter((c) => {
    const inFilter = filter === 'archived' ? c.archived : !c.archived && (filter !== 'unread' || c.unread > 0);
    return inFilter && (!query.trim() || c.name.toLowerCase().includes(query.trim().toLowerCase()));
  }), [adminConversations, filter, query]);

  const active = adminConversations.find((c) => c.id === activeId);
  const shown = active && visible.some((c) => c.id === active.id) ? active : null;

  const changeFilter = (f) => { setFilter(f); setActiveId(null); setThreadOpen(false); };
  const open = (id) => { setActiveId(id); setThreadOpen(true); openAdminConversation(id); };

  const list = (
    <>
      <div className="flex flex-col gap-2.5 border-b border-line p-3">
        <SearchBar value={query} onChange={setQuery} placeholder="Search conversations" className="!w-full" />
        <div className="flex gap-1.5">
          {FILTERS.map(([value, label]) => <Button key={value} size="sm" variant={filter === value ? 'primary' : 'secondary'} aria-pressed={filter === value} onClick={() => changeFilter(value)}>{label}</Button>)}
        </div>
      </div>
      {visible.length
        ? visible.map((c) => <ConversationItem key={c.id} conversation={c} active={c.id === shown?.id} onSelect={open} />)
        : <EmptyState icon={Mail} title="No conversations" description="Nothing here yet." />}
    </>
  );

  const thread = shown ? (
    <MessageThread
      conversation={shown}
      subtitle="Parishioner"
      onBack={() => setThreadOpen(false)}
      actions={(
        <>
          <Button variant="secondary" size="sm" onClick={() => { toggleAdminUnread(shown.id); toast(shown.unread ? 'Marked as read' : 'Marked as unread'); }}>{shown.unread ? 'Mark as read' : 'Mark as unread'}</Button>
          <Button variant="secondary" size="sm" onClick={() => { toggleAdminArchive(shown.id); setActiveId(null); setThreadOpen(false); toast(shown.archived ? 'Moved to inbox' : 'Conversation archived'); }}>{shown.archived ? 'Unarchive' : 'Archive'}</Button>
        </>
      )}
    >
      <Composer onSend={(text) => sendAdminMessage(shown.id, text)} placeholder={`Reply to ${firstName(shown.name)}`} />
    </MessageThread>
  ) : <EmptyState icon={MessageSquare} title="No conversation selected" description="Choose a conversation to read and reply." className="my-auto" />;

  return (
    <>
      <PageHeader title="Messages" subtitle="Conversations with parishioners." actions={<Button onClick={() => { setComposeTo(null); setComposing(true); }}><Plus size={17} aria-hidden="true" /> New message</Button>} />
      <MessagingLayout threadOpen={threadOpen && !!shown} list={list} thread={thread} />
      {composing && (
        <ComposeModal
          parishioners={parishioners}
          initialTo={composeTo}
          onClose={() => setComposing(false)}
          onSend={async (to, text) => { const peer = parishioners.find((p) => p.name === to); const result = await composeAdminMessage(to, text); if (result) { setComposing(false); setFilter('inbox'); setQuery(''); setActiveId(peer?.id ?? null); setThreadOpen(true); toast('Message sent'); } }}
        />
      )}
    </>
  );
}
