import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import Avatar from '../ui/Avatar.jsx';
import IconButton from '../ui/IconButton.jsx';
import { Input } from '../ui/Field.jsx';
import { cn } from '../../utils/cn.js';

/** Two-pane messaging shell. On phones only one pane is shown: the list, or the open thread. */
export function MessagingLayout({ threadOpen, list, thread }) {
  return (
    <div className="grid h-[min(620px,calc(100vh-260px))] min-h-[460px] grid-cols-[320px_1fr] overflow-hidden rounded-[14px] border border-line bg-white max-md:h-[calc(100dvh-230px)] max-md:grid-cols-1">
      <div className={cn('overflow-auto border-r border-line max-md:border-r-0', threadOpen && 'max-md:hidden')}>{list}</div>
      <div className={cn('flex min-h-0 min-w-0 flex-col', !threadOpen && 'max-md:hidden')}>{thread}</div>
    </div>
  );
}

export function ConversationItem({ conversation, active, onSelect }) {
  const last = conversation.messages[conversation.messages.length - 1];
  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      aria-current={active ? 'true' : undefined}
      className={cn('flex w-full items-start gap-3 border-b border-line px-4 py-3.5 text-left hover:bg-paper-3', active && 'bg-wine-1')}
    >
      <Avatar name={conversation.name} size={40} />
      <div className="min-w-0 flex-1">
        <b className="font-semibold">{conversation.name}</b>
        <p className="max-w-[190px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-ink-2 max-md:max-w-[60vw]">{last?.text}</p>
      </div>
      {conversation.unread > 0 && (
        <span className="min-w-5 rounded-full bg-wine text-center text-[11.5px] font-semibold leading-5 text-white" aria-label={`${conversation.unread} unread`}>{conversation.unread}</span>
      )}
    </button>
  );
}

export function MessageBubble({ from, text, time }) {
  const outgoing = from === 'out';
  return (
    <div className={cn('max-w-[76%] rounded-2xl px-3.5 py-2.5 leading-[1.45] max-sm:max-w-[88%]', outgoing ? 'self-end rounded-br-[4px] bg-wine text-white' : 'self-start rounded-bl-[4px] border border-line bg-white')}>
      {text}
      <small className="mt-[3px] block text-[11.5px] opacity-70">{time}</small>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex gap-1 self-start rounded-2xl rounded-bl-[4px] border border-line bg-white px-3.5 py-3" role="status" aria-label="The parish office is typing">
      <i className="typing-dot" /><i className="typing-dot" /><i className="typing-dot" />
    </div>
  );
}

/** Header, scrolling message list and (via children) a composer. */
export function MessageThread({ conversation, subtitle, onBack, actions, typing = false, children }) {
  const endRef = useRef(null);
  const count = conversation.messages.length;
  useEffect(() => { endRef.current?.scrollIntoView?.({ block: 'end' }); }, [count, typing, conversation.id]);

  return (
    <>
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <IconButton size="sm" label="Back to conversations" onClick={onBack} className="md:hidden"><ChevronLeft size={18} /></IconButton>
        <Avatar name={conversation.name} size={36} />
        <div>
          <b>{conversation.name}</b>
          <div className="text-[12.5px] text-ink-3">{subtitle}</div>
        </div>
        <span className="flex-1" />
        {actions}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 overflow-auto bg-paper p-5" aria-live="polite">
        {conversation.messages.map((m, i) => <MessageBubble key={i} {...m} />)}
        {typing && <TypingBubble />}
        <div ref={endRef} />
      </div>
      {children}
    </>
  );
}

export function Composer({ onSend, placeholder = 'Write a message', attach }) {
  const [text, setText] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText('');
  };
  return (
    <form onSubmit={submit} className="flex gap-2.5 border-t border-line bg-white p-3">
      {attach}
      <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
      <IconButton variant="primary" type="submit" label="Send message"><Send size={18} /></IconButton>
    </form>
  );
}
