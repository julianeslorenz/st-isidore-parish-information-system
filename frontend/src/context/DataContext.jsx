import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, getToken, patch, post, remove } from '../api/client.js';

const DataContext = createContext(null);
const empty = { requests: [], appointments: [], events: [], certificates: [], records: [], priests: [], users: [], parishioners: [], adminConversations: [], userConversations: [], myRequests: [], account: null, contacts: [], dashboard: null };
const KIND = { Baptism: 'bap', Marriage: 'wed', Confirmation: 'conf', Funeral: 'mass', Other: 'out' };
const dateAtDay = (day, time = '9:00 AM', date = null) => {
  const d = date ? new Date(`${date}T00:00:00`) : new Date();
  if (!date) d.setDate(Number(day));
  const [clock, meridian] = time.split(' '); const [h, m] = clock.split(':').map(Number);
  d.setHours((h % 12) + (meridian === 'PM' ? 12 : 0), m || 0, 0, 0);
  return d.toISOString();
};
const asEvent = (e) => ({ ...e, day: String(e.day ?? new Date(e.starts_at).getDate()), month: new Date(e.starts_at).toLocaleString([], { month: 'short' }), category: e.category || 'Parish events', kind: e.kind || KIND[e.type] || 'feast', time: e.time || new Date(e.starts_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), location: e.place || '', summary: e.description || '', body: e.description || '' });
const asAppointment = (a) => ({ ...a, day: a.day ?? new Date(a.start_at).getDate(), type: a.type || a.appointment_type || 'Other', kind: a.kind || KIND[a.type] || 'out', time: a.time || new Date(a.start_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), priest: a.priest || '', who: a.who || '', note: a.note || '' });
const asRequest = (r) => ({ ...r, title: `${r.type} request`, forWhom: r.subject, schedule: r.requested, note: r.note || 'The parish office is reviewing your request.' });
const asUser = (u) => ({ ...u, lastLogin: '—', created: u.created_at ? new Date(u.created_at).toLocaleDateString() : '—' });

export function DataProvider({ children }) {
  const [data, setData] = useState(empty);
  const [error, setError] = useState('');
  const refreshInFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    setError('');
    try {
      const eventRows = await api('/events?include_past=true');
      if (!getToken()) { setData({ ...empty, events: eventRows.map(asEvent) }); return; }
      const me = await api('/auth/me');
      const isStaff = ['Admin', 'Parish Secretary', 'Parish Staff', 'Priest'].includes(me.role);
      const requests = me.role === 'Priest' ? [] : await api('/requests');
      const appointments = await api('/appointments');
      const [certificates, messages, contacts, records] = await Promise.all([
        api('/certificates').catch(() => []), api('/messages').catch(() => []), api('/messages/contacts').catch(() => []), api('/records').catch(() => []),
      ]);
      const [priests, users, dash] = isStaff ? await Promise.all([
        api('/priests').catch(() => []), api(me.role === 'Admin' ? '/users' : '/users?role=Parishioner').catch(() => []),
        api('/dashboard').catch(() => null),
      ]) : [[], [], null];
      const report = isStaff ? await api('/reports?months=6').catch(() => null) : null;
      const grouped = new Map();
      for (const m of messages) {
        const peerId = m.sender_id === me.id ? m.receiver_id : m.sender_id;
        const peerName = m.sender_id === me.id ? m.receiver_name : m.sender_name;
        if (!grouped.has(peerId)) grouped.set(peerId, { id: peerId, name: peerName || 'Parish office', unread: 0, archived: Boolean(m.archived), messages: [] });
        const conversation = grouped.get(peerId);
        conversation.archived = Boolean(m.archived);
        conversation.unread = Number(m.unread_count || 0);
        conversation.messages.push({ from: m.sender_id === me.id ? 'out' : 'in', text: m.body, time: new Date(m.created_at).toLocaleString() });
      }
      const conversations = [...grouped.values()];
      for (const contact of contacts) if (!grouped.has(contact.id)) conversations.push({ id: contact.id, name: contact.name, unread: 0, archived: false, messages: [] });
      const reqs = requests.map(asRequest);
      setData({ requests: reqs, appointments: appointments.map(asAppointment), events: eventRows.map(asEvent), records,
        certificates: certificates.map((c) => ({ ...c, date: c.date ? new Date(c.date).toLocaleDateString() : '' })),
        priests: priests.map((p) => ({ ...p, email: p.email || '', phone: p.phone || '', sacraments: p.sacraments || [], availability: p.description || '' })),
        users: users.map(asUser), parishioners: users.filter((u) => u.role === 'Parishioner').map(asUser),
        adminConversations: isStaff ? conversations : [], userConversations: isStaff ? [] : conversations,
        myRequests: isStaff ? [] : reqs, dashboard: dash, report, account: me, contacts,
      });
    } catch (e) { setError(e.message); window.dispatchEvent(new CustomEvent('stisidore-api-error', { detail: e.message })); }
    finally { refreshInFlight.current = false; }
  }, []);

  useEffect(() => {
    refresh();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const interval = window.setInterval(refreshWhenVisible, 15000);
    window.addEventListener('stisidore-auth-changed', refresh);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('stisidore-auth-changed', refresh);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [refresh]);

  const mutate = useCallback(async (operation) => {
    try { const result = await operation(); await refresh(); return result; }
    catch (e) { setError(e.message); window.dispatchEvent(new CustomEvent('stisidore-api-error', { detail: e.message })); return null; }
  }, [refresh]);

  const getRequest = useCallback((id) => data.requests.find((r) => r.id === id), [data.requests]);
  const updateRequest = useCallback((id, changes, timelineText) => {
    const current = data.requests.find((r) => r.id === id);
    const body = { ...changes };
    if ('priest' in body) { body.details = { ...(current?.details || {}), priest_name: body.priest }; delete body.priest; }
    if (timelineText) body.note = timelineText;
    return mutate(() => patch(`/requests/${encodeURIComponent(id)}`, body));
  }, [data.requests, mutate]);
  const addEvent = useCallback((e) => mutate(() => post('/events', { title: e.title, category: e.category || 'Parish events', starts_at: dateAtDay(e.day, e.time, e.date), place: e.location || '', description: e.description || '', status: 'upcoming' })), [mutate]);
  const addAppointment = useCallback((a) => mutate(() => post('/appointments', { title: a.title, appointment_type: a.type, start_at: dateAtDay(a.day, a.time, a.date), status: a.status || 'pending', details: { who: a.who, priest: a.priest, note: a.note } })), [mutate]);
  const updateAppointment = useCallback((id, change) => {
    const old = data.appointments.find((a) => a.id === id);
    if (!old) return Promise.resolve(null);
    const body = {};
    if (change.status) body.status = change.status;
    if (change.day || change.time || change.date) body.start_at = dateAtDay(change.day || old.day, change.time || old.time, change.date);
    if (change.title || old.title) body.title = change.title || old.title;
    if (change.type || old.type) body.appointment_type = change.type || old.type;
    body.details = { who: change.who || old.who, priest: change.priest || old.priest, note: change.note || old.note };
    return mutate(() => patch(`/appointments/${id}`, body));
  }, [data.appointments, mutate]);
  const requestReschedule = useCallback((id, preferredAt, reason) => mutate(() => post(`/appointments/${id}/reschedule-requests`, { preferred_at: new Date(preferredAt).toISOString(), reason })), [mutate]);
  const savePriest = useCallback((p) => mutate(() => p.id
    ? patch(`/priests/${p.id}`, { name: p.name, title: p.role, email: p.email || null, phone: p.phone || null, sacraments: p.sacraments || [], description: p.availability, active: p.status !== 'inactive' })
    : post('/priests', { name: p.name, title: p.role, email: p.email || null, phone: p.phone || null, sacraments: p.sacraments || [], description: p.availability, active: true })), [mutate]);
  const togglePriest = useCallback((id) => { const p = data.priests.find((x) => x.id === id); return p && mutate(() => patch(`/priests/${id}`, { name: p.name, title: p.role, email: p.email || null, phone: p.phone || null, sacraments: p.sacraments || [], description: p.availability, active: p.status !== 'active' })); }, [data.priests, mutate]);
  const saveRecord = useCallback((record) => mutate(() => record.id ? patch(`/records/${record.id}`, record.payload) : post('/records', record.payload)), [mutate]);
  const deleteRecord = useCallback((id) => mutate(async () => { await remove(`/records/${id}`); return { deleted: true }; }), [mutate]);
  const saveUser = useCallback((u) => mutate(() => u.id ? patch(`/users/${u.id}`, { role: u.role }) : post('/users', { name: u.name, email: u.email, password: u.password, role: u.role })), [mutate]);
  const toggleUser = useCallback((id) => { const u = data.users.find((x) => x.id === id); return u && mutate(() => patch(`/users/${id}`, { status: u.status === 'active' ? 'inactive' : 'active' })); }, [data.users, mutate]);
  const addCertificate = useCallback((name, type, details = {}) => mutate(() => post(data.account && data.account.role === 'Parishioner' ? '/certificates/request' : '/certificates', { person_name: name, certificate_type: type, details })), [data.account, mutate]);
  const updateCertificateDetails = useCallback((id, name, details) => mutate(() => patch(`/certificates/${id}/details`, { person_name: name, details })), [mutate]);
  const advanceCertificate = useCallback((number) => {
    const c = data.certificates.find((x) => x.number === number);
    const next = { processing: 'signature', signature: 'ready', ready: 'released' }[c?.status];
    return next ? mutate(() => patch(`/certificates/${c.id}`, { status: next })) : Promise.resolve(null);
  }, [data.certificates, mutate]);
  const cancelCertificate = useCallback((number) => {
    const c = data.certificates.find((x) => x.number === number);
    return c && mutate(() => patch(`/certificates/${c.id}`, { status: 'cancelled' }));
  }, [data.certificates, mutate]);
  const revokeCertificate = useCallback((number, reason) => {
    const c = data.certificates.find((x) => x.number === number);
    return c && mutate(() => patch(`/certificates/${c.id}`, { status: 'revoked', note: reason }));
  }, [data.certificates, mutate]);
  const submitMyRequest = useCallback((service, summary) => mutate(() => {
    const documents = Object.values(summary.documents || {}).filter((document) => document?.file);
    const form = new FormData();
    form.append('request_payload', JSON.stringify({
      sacrament_type: service,
      details: { ...(summary.details || {}), person_name: summary.forWhom, forWhom: summary.forWhom },
      schedule_at: dateAtDay(0, summary.time, summary.date),
    }));
    form.append('document_labels', JSON.stringify(documents.map((document) => document.label)));
    documents.forEach((document) => form.append('files', document.file, document.file.name));
    return api('/requests/submit', { method: 'POST', body: form });
  }), [mutate]);
  const cancelMyRequest = useCallback((id) => mutate(() => post(`/requests/${encodeURIComponent(id)}/cancel`, {})), [mutate]);
  const sendMessage = useCallback((peerId, text) => mutate(() => post('/messages', { receiver_id: Number(peerId), body: text })), [mutate]);
  const markRead = useCallback((peerId) => mutate(() => patch(`/messages/conversations/${peerId}`, { unread: false })), [mutate]);
  const toggleUnread = useCallback((peerId) => { const c = [...data.adminConversations, ...data.userConversations].find((item) => item.id === peerId); return mutate(() => patch(`/messages/conversations/${peerId}`, { unread: !(c?.unread > 0) })); }, [data.adminConversations, data.userConversations, mutate]);
  const toggleArchive = useCallback((peerId) => { const c = data.adminConversations.find((item) => item.id === peerId); return mutate(() => patch(`/messages/conversations/${peerId}`, { archived: !c?.archived })); }, [data.adminConversations, mutate]);
  const composeAdminMessage = useCallback((name, text) => {
    const peer = data.parishioners.find((u) => u.name === name || u.id === Number(name));
    return peer ? sendMessage(peer.id, text) : Promise.resolve(null);
  }, [data.parishioners, sendMessage]);

  const value = useMemo(() => ({ ...data, error, refresh, getRequest, updateRequest, addEvent,
    addAppointment, updateAppointment, requestReschedule, savePriest, togglePriest, saveRecord, deleteRecord, saveUser, toggleUser,
    addCertificate, updateCertificateDetails, advanceCertificate, cancelCertificate, revokeCertificate,
    submitMyRequest, cancelMyRequest, sendUserMessage: sendMessage, sendAdminMessage: sendMessage,
    markUserConversationRead: markRead, openAdminConversation: markRead, toggleAdminUnread: toggleUnread, toggleAdminArchive: toggleArchive, composeAdminMessage,
  }), [data, error, refresh, getRequest, updateRequest, addEvent, addAppointment, updateAppointment,
    requestReschedule, savePriest, togglePriest, saveRecord, deleteRecord, saveUser, toggleUser, addCertificate, advanceCertificate,
    cancelCertificate, revokeCertificate, updateCertificateDetails, submitMyRequest, cancelMyRequest, sendMessage, markRead, toggleUnread, toggleArchive, composeAdminMessage]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
};
