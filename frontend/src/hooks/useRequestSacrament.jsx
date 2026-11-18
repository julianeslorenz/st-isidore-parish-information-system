import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoginRequiredModal from '../components/modals/LoginRequiredModal.jsx';

/**
 * Public "Request a sacrament" behaviour: signed-in parishioners go straight to the wizard,
 * visitors see a login prompt that remembers the chosen service.
 * Render `dialog` somewhere in the page.
 */
export function useRequestSacrament() {
  const { parishioner } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(null);

  const requestSacrament = (service) => {
    if (parishioner) navigate('/portal/requests/new', { state: service ? { service } : undefined });
    else setPrompt({ service: service || undefined });
  };

  const dialog = prompt ? <LoginRequiredModal service={prompt.service} onClose={() => setPrompt(null)} /> : null;
  return { requestSacrament, dialog, isSignedIn: !!parishioner };
}
