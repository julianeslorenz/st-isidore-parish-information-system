import { useReducer } from 'react';
import { SACRAMENTS, WIZARD_DATES } from '../data/sacraments.js';

export const initialWizard = (service = 'Baptism') => ({
  step: 1,
  service,
  date: WIZARD_DATES[0],
  time: '9:00 AM',
  docs: {},
  agree: false,
  done: false,
  submitting: false,
  fields: {
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    priest: '',
  },
});

export function wizardReducer(state, action) {
  switch (action.type) {
    case 'service': {
      // Changing the service resets documents and the service-specific detail fields.
      const detailKeys = Object.values(SACRAMENTS).flatMap((s) => s.fields.map((f) => f.key));
      const fields = { ...state.fields };
      detailKeys.forEach((k) => delete fields[k]);
      return { ...state, service: action.value, docs: {}, fields };
    }
    case 'field': return { ...state, fields: { ...state.fields, [action.key]: action.value } };
    case 'date': return { ...state, date: action.value };
    case 'time': return { ...state, time: action.value };
    case 'setDoc': {
      const docs = { ...state.docs };
      if (action.file) docs[action.index] = { file: action.file, label: action.label };
      else delete docs[action.index];
      return { ...state, docs };
    }
    case 'agree': return { ...state, agree: action.value };
    case 'step': return { ...state, step: action.value };
    case 'submitting': return { ...state, submitting: true };
    case 'submitFailed': return { ...state, submitting: false };
    case 'done': return { ...state, submitting: false, done: true };
    case 'reset': return initialWizard(action.service);
    default: return state;
  }
}

export function useRequestWizard(service) {
  const [state, dispatch] = useReducer(wizardReducer, service, initialWizard);
  // Service-specific details begin blank and only contain what the user types.
  const detailValue = (field) => state.fields[field.key] ?? '';
  return { state, dispatch, detailValue };
}
