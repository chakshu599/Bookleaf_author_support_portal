'use client';

import { useEffect, useState } from 'react';

type T = {
  id: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  author: { name: string; email: string };
  book: { title: string } | null;
  messages?: { id: string; body: string; sender: { email: string } | null }[];
  notes?: { id: string; body: string; author: { email: string } }[];
};

const values = {
  status: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  category: ['ROYALTY_PAYMENTS', 'ISBN_METADATA', 'PRINTING_QUALITY', 'DISTRIBUTION_AVAILABILITY', 'BOOK_STATUS_PRODUCTION', 'GENERAL_INQUIRY'],
  priority: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
};
const label = (value: string) => value.replaceAll('_', ' ');

export default function Admin() {
  const [tickets, setTickets] = useState<T[]>([]);
  const [selected, setSelected] = useState<T | null>(null);
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', from: '' });

  const load = () => {
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    fetch(`/api/admin/tickets?${query}`)
      .then((response) => response.json())
      .then((result) => setTickets(result.data || []));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [filters]);

  async function open(ticket: T) {
    const [detailResponse, draftResponse] = await Promise.all([
      fetch(`/api/admin/tickets/${ticket.id}`),
      fetch(`/api/admin/tickets/${ticket.id}/reply`),
    ]);
    const [detail, draftResult] = await Promise.all([detailResponse.json(), draftResponse.json()]);
    if (!detailResponse.ok) {
      setActionError(detail.error?.message || 'Could not load this ticket.');
      return;
    }
    setActionError('');
    setSelected(detail.data);
    setDraft(draftResult.data?.draft || '');
  }

  async function reply() {
    if (!selected) return;
    await fetch(`/api/admin/tickets/${selected.id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: draft }),
    });
    setDraft('');
    await open(selected);
    load();
  }

  async function manage(data: Record<string, unknown>) {
    if (!selected) return;
    const response = await fetch(`/api/admin/tickets/${selected.id}/manage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      setActionError(result.error?.message || 'Could not save the ticket change.');
      return;
    }
    setActionError('');
    setSelected((current) => current?.id === selected.id ? {
      ...current,
      ...(typeof result.data?.status === 'string' ? { status: result.data.status } : {}),
      ...(typeof result.data?.category === 'string' ? { category: result.data.category } : {}),
      ...(typeof result.data?.priority === 'string' ? { priority: result.data.priority } : {}),
    } : current);
    load();
  }

  return <>
    <h1>Ticket queue</h1>
    <p className="muted">Unresolved, critical, and oldest requests appear first.</p>
    <div className="filters">
      {Object.entries(values).map(([key, options]) => (
        <select key={key} value={filters[key as keyof typeof filters]} onChange={(event) => setFilters({ ...filters, [key]: event.target.value })}>
          <option value="">All {key}</option>
          {options.map((option) => <option key={option} value={option}>{label(option)}</option>)}
        </select>
      ))}
      <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
    </div>
    <div className="split">
      <div>
        {tickets.length ? tickets.map((ticket) => (
          <button type="button" className={`ticket ${selected?.id === ticket.id ? 'selected' : ''}`} key={ticket.id} onClick={() => open(ticket)}>
            <div className="row"><span className={`badge ${ticket.priority}`}>{label(ticket.priority)}</span><b>{ticket.subject}</b></div>
            <small>{ticket.author.name} · {label(ticket.category)} · {label(ticket.status)}</small>
          </button>
        )) : <div className="card empty">No tickets match these filters.</div>}
      </div>
      <section className="card">
        {selected ? <>
          <h2>{selected.subject}</h2>
          <p className="muted">{selected.author.name} · {selected.author.email}{selected.book && ` · ${selected.book.title}`}</p>
          <div className="message author">{selected.description}</div>
          {actionError && <p role="alert" className="error">{actionError}</p>}
          <button type="button" onClick={() => manage({ assignToSelf: true, status: 'IN_PROGRESS' })}>Assign to me</button>
          <label>Status<select value={selected.status} onChange={(event) => manage({ status: event.target.value })}>{values.status.map((option) => <option key={option} value={option}>{label(option)}</option>)}</select></label>
          <label>AI category / override<select value={selected.category} onChange={(event) => manage({ category: event.target.value })}>{values.category.map((option) => <option key={option} value={option}>{label(option)}</option>)}</select></label>
          <label>AI priority / override<select value={selected.priority} onChange={(event) => manage({ priority: event.target.value })}>{values.priority.map((option) => <option key={option} value={option}>{label(option)}</option>)}</select></label>
          <h3>Conversation</h3>
          {selected.messages?.map((message) => <div className="message" key={message.id}><small>{message.sender?.email || 'BookLeaf team'}</small><br />{message.body}</div>)}
          <label>Internal notes</label>
          {selected.notes?.map((item) => <div className="note" key={item.id}><b>{item.author.email}: </b>{item.body}</div>)}
          <textarea placeholder="Private internal note (not visible to author)" value={note} onChange={(event) => setNote(event.target.value)} />
          <button type="button" onClick={async () => { await manage({ note }); setNote(''); }}>Add private note</button>
          <label>Reply (AI draft; edit before sending)</label>
          <textarea aria-label="Editable AI draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
          <button type="button" className="primary" onClick={reply}>Send reply</button>
        </> : <div className="empty">Select a ticket to see author details, AI draft, and notes.</div>}
      </section>
    </div>
  </>;
}
