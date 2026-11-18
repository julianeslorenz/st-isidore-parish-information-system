import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

/** Shown when a visitor tries to request a sacrament without being signed in. */
export default function LoginRequiredModal({ service, onClose }) {
  const navigate = useNavigate();
  const go = (to) => navigate(to, { state: { from: '/portal/requests/new', service } });
  return (
    <Modal
      open
      onClose={onClose}
      title="Login required"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" onClick={() => go('/register')}>Create account</Button>
          <Button onClick={() => go('/login')}>Login</Button>
        </>
      )}
    >
      <p>Please log in or create an account to submit a sacrament request.</p>
    </Modal>
  );
}
