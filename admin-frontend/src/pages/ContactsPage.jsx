import { useState, useEffect } from 'react';
import { Mail, Trash2, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import styles from './ContactsPage.module.css';

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ContactsPage() {
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMessages(data || []);
        setLoading(false);
      });
  }, []);

  async function markRead(id) {
    await supabase.from('contact_messages').update({ read: true }).eq('id', id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  }

  async function deleteMsg(id) {
    if (!confirm('Delete this message?')) return;
    await supabase.from('contact_messages').delete().eq('id', id);
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function openMsg(msg) {
    setSelected(msg);
    if (!msg.read) markRead(msg.id);
  }

  const unread = messages.filter(m => !m.read).length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Contact Messages</h1>
          {unread > 0 && (
            <span className={styles.unreadBadge}>{unread} unread</span>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Email</th>
              <th>Preview</th>
              <th>Received</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={styles.empty}>Loading…</td></tr>
            ) : messages.length === 0 ? (
              <tr><td colSpan={6} className={styles.empty}>No messages yet.</td></tr>
            ) : messages.map(m => (
              <tr key={m.id} className={!m.read ? styles.unreadRow : ''}>
                <td>
                  {!m.read && <span className={styles.dot} />}
                </td>
                <td className={styles.name}>{m.name}</td>
                <td className={styles.email}>{m.email}</td>
                <td className={styles.preview}>{m.message.slice(0, 60)}{m.message.length > 60 ? '…' : ''}</td>
                <td className={styles.date}>{formatDate(m.created_at)}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.viewBtn} onClick={() => openMsg(m)}>
                      <Eye size={14} /> View
                    </button>
                    <button className={styles.delBtn} onClick={() => deleteMsg(m.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalMeta}>
              <div className={styles.modalMetaIcon}><Mail size={20} /></div>
              <div>
                <p className={styles.modalName}>{selected.name}</p>
                <p className={styles.modalEmail}>{selected.email}</p>
              </div>
              <p className={styles.modalDate}>{formatDate(selected.created_at)}</p>
            </div>
            <div className={styles.modalBody}>
              {selected.message}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.replyBtn} onClick={() => window.open(`mailto:${selected.email}?subject=Re: Your message to Hunny`)}>
                Reply via Email
              </button>
              <button className={styles.modalClose} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
