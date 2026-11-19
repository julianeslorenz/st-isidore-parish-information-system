import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Paperclip } from 'lucide-react';
import PortalPage from '../../components/layout/PortalPage.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import IconButton from '../../components/ui/IconButton.jsx';
import { Composer, ConversationItem, MessageThread, MessagingLayout } from '../../components/common/Messaging.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useIsMobile } from '../../hooks/useMediaQuery.js';
import EmptyState from '../../components/ui/EmptyState.jsx';

export default function PortalMessagesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userConversations, markUserConversationRead, sendUserMessage } = useData();
  const toast = useToast();
  const isMobile = useIsMobile();
  const [activeId, setActiveId] = useState(userConversations[0]?.id ?? null);
  const [threadOpen, setThreadOpen] = useState(false); // phones: list first, then thread
  useEffect(() => {
    const requestedId = Number(new URLSearchParams(location.search).get('conversationId'));
    if (requestedId && userConversations.some((conversation) => conversation.id === requestedId)) {
      setThreadOpen(true);
      if (activeId !== requestedId) {
        setActiveId(requestedId);
        markUserConversationRead(requestedId);
      }
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, userConversations, activeId, markUserConversationRead, navigate]);
  useEffect(() => { if (activeId === null && userConversations.length) setActiveId(userConversations[0].id); }, [activeId, userConversations]);

  // On desktop the active thread is visible immediately, so it counts as read.
  useEffect(() => { if (!isMobile) markUserConversationRead(activeId); }, [isMobile, activeId, markUserConversationRead]);

  const active = userConversations.find((c) => c.id === activeId);

  const open = (id) => { setActiveId(id); setThreadOpen(true); markUserConversationRead(id); };

  // Simulated reply: show the typing indicator, then add a canned answer.
  const send = async (text) => { await sendUserMessage(activeId, text); };

  return (
    <PortalPage>
      <PageHeader title="Messages" subtitle="Talk with the parish office and your priests." />
      <MessagingLayout
        threadOpen={threadOpen}
        list={userConversations.map((c) => <ConversationItem key={c.id} conversation={c} active={c.id === activeId} onSelect={open} />)}
        thread={active ? (
          <MessageThread conversation={active} subtitle="Usually replies within a day" onBack={() => setThreadOpen(false)}>
            <Composer
              onSend={send}
              placeholder="Write a message"
              attach={<IconButton label="Attach a file" onClick={() => toast('Choose a file to attach')}><Paperclip size={19} /></IconButton>}
            />
          </MessageThread>
        ) : <EmptyState title="No parish office conversations yet" description="Your messages will appear here when you contact the parish office." />}
      />
    </PortalPage>
  );
}
