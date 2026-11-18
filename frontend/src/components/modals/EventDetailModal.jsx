import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { Tag } from '../ui/Badge.jsx';
import KeyValue from '../ui/KeyValue.jsx';

export default function EventDetailModal({ event, onClose }) {
  return (
    <Modal open onClose={onClose} title={event.title} footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>
      <Tag>{event.category}</Tag>
      <p className="my-3">{event.body}</p>
      <KeyValue labelWidth={90} items={[['Date', `${event.month} ${event.day}, 2026`], ['Time', event.time], ['Location', event.location]]} />
    </Modal>
  );
}
