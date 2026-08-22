import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, EmptyState } from '../../ui/components/common';
import { Search, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export const TeamDirectory: React.FC = () => {
  const { users, attendance, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const today = new Date().toISOString().split('T')[0];
  const todayAtt = attendance.filter(a => a.date === today);

  const uniqueDepts = ['All', ...Array.from(new Set(users.map(u => u.departmentName)))];
  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.designation.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || u.departmentName === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div>
      <div className="page-header">
        <h1>Team Directory</h1>
        <p>Find and connect with your colleagues. See who's in the office today.</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '.85rem 1rem' }}>
        <div style={{ display: 'flex', gap: '.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-icon-wrap" style={{ flex: 1, minWidth: 200 }}>
            <Search size={15} className="input-icon" />
            <input className="form-control" placeholder="Search by name or role..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
            {uniqueDepts.map(d => (
              <button key={d} className={`btn btn-sm ${deptFilter === d ? 'btn-primary' : 'btn-outline'}`} onClick={() => setDeptFilter(d)}>{d}</button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0
        ? <EmptyState icon={<Search size={40} />} title="No results" subtitle="Try a different search or filter." />
        : (
          <div className="team-grid">
            {filtered.map(u => {
              const rec = todayAtt.find(a => a.employeeId === u.employeeId);
              const isPresent = rec && ['Present', 'WFH', 'Late'].includes(rec.status);
              const isSelf = u.id === currentUser.id;
              return (
                <div key={u.id} className="team-card" style={isSelf ? { border: '2px solid var(--primary)' } : undefined}>
                  <div className="team-card-top">
                    <img src={u.avatar} alt={u.name} />
                    <div className="name">
                      {u.name} {isSelf && <span style={{ fontSize: '.72rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '1px 6px', borderRadius: 99, fontWeight: 800, marginLeft: 4 }}>(You)</span>}
                    </div>
                    <div className="role">{u.designation}</div>
                  </div>
                  <div className="team-card-body">
                    <div className="team-detail">
                      <div className={`presence-dot ${isPresent ? 'online' : 'offline'}`} />
                      <span style={{ fontWeight: 600, color: isPresent ? 'var(--green)' : 'var(--text-4)', fontSize: '.77rem' }}>{isPresent ? `${rec!.status} Today` : 'Not In Office'}</span>
                    </div>
                    <div className="team-detail"><MapPin size={12} /><span>{u.departmentName}</span></div>
                    <div className="team-detail"><Mail size={12} /><a href={`mailto:${u.email}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{u.email}</a></div>
                    <div className="team-detail"><Phone size={12} /><span>{u.phone}</span></div>
                    <div className="team-detail"><Calendar size={12} /><span>Joined {u.joinDate}</span></div>
                    {u.employmentStatus !== 'Active' && <span className={getBadgeClass(u.employmentStatus)} style={{ marginTop: '.25rem' }}>{u.employmentStatus}</span>}
                    {u.skills && (
                      <div style={{ marginTop: '.6rem', display: 'flex', flexWrap: 'wrap' }}>
                        {u.skills.slice(0, 3).map(s => <span key={s} className="skill-tag">{s}</span>)}
                        {u.skills.length > 3 && <span className="skill-tag">+{u.skills.length - 3}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
};
