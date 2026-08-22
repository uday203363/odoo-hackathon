import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal, EmptyState } from '../../ui/components/common';
import { Plus, Megaphone, Trash2, Eye, Check, Users } from 'lucide-react';
import type { AnnouncementPriority } from '../../types';

export const AnnouncementsManager: React.FC = () => {
  const { announcements, users, postAnnouncement, deleteAnnouncement, currentUser, markAnnouncementRead } = useApp();
  const isAdmin = currentUser.role === 'admin';
  const [showModal, setShowModal] = useState(false);
  const [viewAnn, setViewAnn] = useState<typeof announcements[0] | null>(null);
  const [form, setForm] = useState({ title: '', content: '', priority: 'Info' as AnnouncementPriority, expiresOn: '' });

  const myAnnouncements = isAdmin
    ? announcements
    : announcements.filter(a => !a.expiresOn || new Date(a.expiresOn) >= new Date());

  const handlePost = () => {
    postAnnouncement({ ...form, postedBy: currentUser.name });
    setShowModal(false); setForm({ title: '', content: '', priority: 'Info', expiresOn: '' });
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Announcements</h1><p>{isAdmin ? 'Post and manage company-wide announcements.' : 'Company announcements and updates.'}</p></div>
          {isAdmin && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Announcement</button>}
        </div>
      </div>

      {myAnnouncements.length === 0
        ? <EmptyState icon={<Megaphone size={40} />} title="No Announcements" subtitle="Nothing posted yet." />
        : myAnnouncements.map(a => {
          const unread = !a.readBy.includes(currentUser.employeeId);
          return (
            <div key={a.id} className={`ann-card ${unread && !isAdmin ? 'unread' : ''}`} style={{ cursor: 'default', flexDirection: 'column', gap: '.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <div className={`ann-priority ${a.priority}`} style={{ width: 4, height: 44, borderRadius: 99, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '.95rem' }}>{a.title}</strong>
                    <span className={getBadgeClass(a.priority)}>{a.priority}</span>
                    {unread && !isAdmin && <span className="badge badge-pending" style={{ fontSize: '.68rem' }}>Unread</span>}
                  </div>
                  <p style={{ fontSize: '.8rem', color: 'var(--text-3)', marginTop: '.25rem' }}>{a.postedBy} · {a.postedOn}{a.expiresOn ? ` · Expires: ${a.expiresOn}` : ''}</p>
                </div>
                <div style={{ display: 'flex', gap: '.4rem', flexShrink: 0 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => { setViewAnn(a); markAnnouncementRead(a.id); }}><Eye size={13} /> Read</button>
                  {isAdmin && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => { if (confirm('Delete?')) deleteAnnouncement(a.id); }}><Trash2 size={13} /></button>}
                </div>
              </div>
              <p style={{ paddingLeft: '1.25rem', fontSize: '.83rem', color: 'var(--text-2)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.content}</p>
              {isAdmin && <div style={{ paddingLeft: '1.25rem', fontSize: '.75rem', color: 'var(--text-4)', display: 'flex', alignItems: 'center', gap: '.4rem' }}><Users size={12} />{a.readBy.length} of {users.length} read</div>}
            </div>
          );
        })
      }

      {/* Post Modal (Admin) */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Post New Announcement"
        footer={<><button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handlePost}><Megaphone size={15} /> Publish</button></>}>
        <div className="form-group"><label className="form-label">Title *</label><input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Content *</label><textarea className="form-control" rows={5} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-control" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as AnnouncementPriority })}>
              <option>Info</option><option>Important</option><option>Urgent</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Expires On (optional)</label><input type="date" className="form-control" value={form.expiresOn} onChange={e => setForm({ ...form, expiresOn: e.target.value })} /></div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewAnn} onClose={() => setViewAnn(null)} title={viewAnn?.title || ''} size="sm"
        footer={<><span className={getBadgeClass(viewAnn?.priority || '')}>{viewAnn?.priority}</span><button className="btn btn-outline" onClick={() => setViewAnn(null)}>Close</button></>}>
        {viewAnn && (
          <div>
            <p style={{ fontSize: '.82rem', color: 'var(--text-3)', marginBottom: '1rem' }}>By {viewAnn.postedBy} · {viewAnn.postedOn}</p>
            <p style={{ fontSize: '.95rem', lineHeight: 1.7 }}>{viewAnn.content}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginTop: '1rem', color: 'var(--green)', fontSize: '.8rem' }}>
              <Check size={14} /><span>Marked as read</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
