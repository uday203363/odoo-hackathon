import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal, EmptyState } from '../../ui/components/common';
import { Plus, Megaphone, Trash2, Eye, Check, Users, Calendar, AlertCircle } from 'lucide-react';
import type { AnnouncementPriority } from '../../types';

export const AnnouncementsManager: React.FC = () => {
  const { announcements, users, postAnnouncement, deleteAnnouncement, currentUser, markAnnouncementRead } = useApp();
  const isAdmin = currentUser.role === 'admin';
  const [showModal, setShowModal] = useState(false);
  const [viewAnn, setViewAnn] = useState<typeof announcements[0] | null>(null);
  const [form, setForm] = useState({ title: '', content: '', priority: 'Info' as AnnouncementPriority, expiresOn: '' });
  const [filterPriority, setFilterPriority] = useState<string>('All');

  const myAnnouncements = (isAdmin
    ? announcements
    : announcements.filter(a => !a.expiresOn || new Date(a.expiresOn) >= new Date())
  ).filter(a => filterPriority === 'All' || a.priority === filterPriority);

  const unreadCount = announcements.filter(a => !a.readBy.includes(currentUser.employeeId)).length;

  const handlePost = () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert('Please fill out the announcement title and content.');
      return;
    }
    postAnnouncement({ ...form, postedBy: currentUser.name });
    setShowModal(false);
    setForm({ title: '', content: '', priority: 'Info', expiresOn: '' });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Company Announcements</h1>
            <p>{isAdmin ? 'Post and manage company-wide notices and official updates.' : 'Stay informed with official company news and updates.'}</p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> New Announcement
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {['All', 'Info', 'Important', 'Urgent'].map(p => (
              <button
                key={p}
                className={`btn btn-sm ${filterPriority === p ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', fontSize: '.82rem', color: 'var(--text-3)', fontWeight: 600 }}>
            <Megaphone size={16} color="var(--primary)" />
            <span>Total: {announcements.length}</span>
            {unreadCount > 0 && <span className="badge badge-urgent">{unreadCount} Unread</span>}
          </div>
        </div>
      </div>

      {/* Announcements List */}
      {myAnnouncements.length === 0 ? (
        <EmptyState icon={<Megaphone size={40} />} title="No Announcements Found" subtitle="There are no announcements matching your current filter." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myAnnouncements.map(a => {
            const unread = !a.readBy.includes(currentUser.employeeId);
            return (
              <div
                key={a.id}
                className={`ann-card ${unread && !isAdmin ? 'unread' : ''}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>{a.title}</h3>
                    <span className={getBadgeClass(a.priority)}>{a.priority}</span>
                    {unread && !isAdmin && <span className="badge badge-pending" style={{ fontSize: '.7rem' }}>New Unread</span>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => { setViewAnn(a); markAnnouncementRead(a.id); }}
                    >
                      <Eye size={14} /> Read Announcement
                    </button>
                    {isAdmin && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--red)', padding: '.35rem .6rem' }}
                        title="Delete Announcement"
                        onClick={() => { if (confirm('Are you sure you want to delete this announcement?')) deleteAnnouncement(a.id); }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '.88rem', color: 'var(--text-2)', lineHeight: 1.6, margin: '.25rem 0' }}>
                  {a.content}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem', borderTop: '1px solid var(--border)', paddingTop: '.75rem', marginTop: '.25rem', fontSize: '.78rem', color: 'var(--text-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-2)' }}>Posted by {a.postedBy}</span>
                    <span>· {a.postedOn}</span>
                    {a.expiresOn && <span style={{ color: 'var(--yellow)', fontWeight: 600 }}> · Expires: {a.expiresOn}</span>}
                  </div>

                  {isAdmin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', color: 'var(--text-4)' }}>
                      <Users size={13} />
                      <span>{a.readBy.length} of {users.length} read</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Modal (Admin) */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Post New Announcement"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handlePost}><Megaphone size={15} /> Publish Announcement</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Announcement Title *</label>
          <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Annual Company Offsite 2026" />
        </div>
        <div className="form-group">
          <label className="form-label">Content / Message Body *</label>
          <textarea className="form-control" rows={5} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write full details about the update..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <select className="form-control" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as AnnouncementPriority })}>
              <option>Info</option>
              <option>Important</option>
              <option>Urgent</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Expiration Date (optional)</label>
            <input type="date" className="form-control" value={form.expiresOn} onChange={e => setForm({ ...form, expiresOn: e.target.value })} />
          </div>
        </div>
      </Modal>

      {/* View Announcement Modal */}
      <Modal open={!!viewAnn} onClose={() => setViewAnn(null)} title={viewAnn?.title || ''} size="md"
        footer={
          <>
            <span className={getBadgeClass(viewAnn?.priority || '')}>{viewAnn?.priority}</span>
            <button className="btn btn-primary" onClick={() => setViewAnn(null)}>Close</button>
          </>
        }
      >
        {viewAnn && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.82rem', color: 'var(--text-3)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '.75rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>Posted by {viewAnn.postedBy}</span>
              <span>· {viewAnn.postedOn}</span>
            </div>
            <p style={{ fontSize: '.95rem', lineHeight: 1.7, color: 'var(--text-1)', whiteSpace: 'pre-line' }}>{viewAnn.content}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginTop: '1.5rem', color: 'var(--green)', fontSize: '.83rem', fontWeight: 700 }}>
              <Check size={16} /><span>Marked as read</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
