import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal, EmptyState } from '../../ui/components/common';
import { Users, Plus, Edit3, Trash2, Search, Eye, DollarSign, Mail, Phone, MapPin, Briefcase, FileText, UserPlus, Key } from 'lucide-react';
import type { User } from '../../types';

export const EmployeeManagement: React.FC = () => {
  const { users, departments, currentUser, activeTab, updateProfile, updateSalary, setSelectedEmployee, selectedEmployee, addEmployee } = useApp();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [editModal, setEditModal] = useState(false);
  const [salaryModal, setSalaryModal] = useState(false);
  const [addEmpModal, setAddEmpModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  // Forms
  const [profileForm, setProfileForm] = useState<Partial<User>>({});
  const [salaryForm, setSalaryForm] = useState<User['salary']>({ basic: 0, hra: 0, conveyance: 0, specialAllowance: 0, medicalAllowance: 0, pfDeduction: 0, taxDeduction: 0, professionalTax: 0, netSalary: 0 });

  // Add Employee Form calculation
  const nextEmpNum = Math.max(...users.map(u => {
    const num = parseInt(u.employeeId.replace('EMP-', ''), 10);
    return isNaN(num) ? 100 : num;
  }), 100) + 1;
  const autoEmpId = `EMP-${nextEmpNum}`;

  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    password: 'join@123',
    designation: 'Software Engineer',
    departmentId: departments[0]?.id || 'dept-2',
    departmentName: departments[0]?.name || 'Engineering',
    phone: '+1 (555) 123-4567',
    address: 'San Francisco, CA',
    joinDate: new Date().toISOString().split('T')[0],
    basic: 4500,
    hra: 1800,
  });

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(s) || u.employeeId.toLowerCase().includes(s) || u.designation.toLowerCase().includes(s);
    const matchDept = deptFilter === 'All' || u.departmentName === deptFilter;
    return matchSearch && matchDept;
  });

  const openEdit = (u: User) => { setEditUser(u); setProfileForm({ name: u.name, designation: u.designation, phone: u.phone, address: u.address, bio: u.bio, departmentId: u.departmentId, departmentName: u.departmentName, employmentStatus: u.employmentStatus }); setEditModal(true); };
  const openSalary = (u: User) => { setEditUser(u); setSalaryForm(u.salary); setSalaryModal(true); };

  const handleSaveProfile = () => { if (editUser) { updateProfile(editUser.id, profileForm); setEditModal(false); } };
  const computeNet = (s: User['salary']) => s.basic + s.hra + s.conveyance + s.specialAllowance + s.medicalAllowance - s.pfDeduction - s.taxDeduction - s.professionalTax;

  const handleCreateEmployee = async () => {
    if (!newEmp.name || !newEmp.email) return;
    const selectedDept = departments.find(d => d.id === newEmp.departmentId);
    await addEmployee({
      ...newEmp,
      departmentName: selectedDept?.name || newEmp.departmentName,
    });
    setAddEmpModal(false);
    setNewEmp({ name: '', email: '', password: 'join@123', designation: 'Software Engineer', departmentId: departments[0]?.id || 'dept-2', departmentName: departments[0]?.name || 'Engineering', phone: '+1 (555) 123-4567', address: 'San Francisco, CA', joinDate: new Date().toISOString().split('T')[0], basic: 4500, hra: 1800 });
  };

  // Profile View mode (either if employee selected, or activeTab === 'profile')
  const displayUser = selectedEmployee || (activeTab === 'profile' ? currentUser : null);

  if (displayUser) {
    const u = displayUser;
    const isSelf = u.id === currentUser.id;
    return (
      <div>
        <div className="page-header">
          <div className="page-header-row">
            <div><h1>{isSelf ? 'My Profile' : 'Employee Profile'}</h1></div>
            <div style={{ display: 'flex', gap: '.6rem' }}>
              {!isSelf && <button className="btn btn-outline" onClick={() => setSelectedEmployee(null)}>← Back to List</button>}
              <button className="btn btn-outline" onClick={() => openEdit(u)}><Edit3 size={14} /> Edit Profile</button>
              {currentUser.role === 'admin' && <button className="btn btn-primary" onClick={() => openSalary(u)}><DollarSign size={14} /> Salary Structure</button>}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', alignItems: 'start' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <img src={u.avatar} alt="" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem', border: '3px solid var(--primary-light)' }} />
            <h2 style={{ fontWeight: 800 }}>{u.name}</h2>
            <p style={{ color: 'var(--text-3)', fontSize: '.87rem', marginTop: '.15rem' }}>{u.designation}</p>
            <div style={{ marginTop: '.75rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              <span className={getBadgeClass(u.employmentStatus)} style={{ alignSelf: 'center' }}>{u.employmentStatus}</span>
              <span style={{ fontWeight: 700, fontSize: '.83rem', color: 'var(--primary)' }}>{u.employeeId}</span>
            </div>
            {u.bio && <p style={{ marginTop: '1rem', fontSize: '.82rem', color: 'var(--text-3)', lineHeight: 1.6 }}>{u.bio}</p>}
            {u.skills && <div style={{ marginTop: '.85rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>{u.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}</div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>Employment Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                {[['Department', u.departmentName], ['Manager', u.managerName || 'Executive Board'], ['Join Date', u.joinDate], ['Birthday', u.birthDate || '—'], ['Email', u.email], ['Phone', u.phone]].map(([l, v]) => (
                  <div key={l}><p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{l}</p><p style={{ fontWeight: 600, fontSize: '.87rem', marginTop: '.1rem' }}>{v}</p></div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>Leave Balances</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.65rem' }}>
                {Object.entries(u.leaveBalances).map(([type, val]) => (
                  <div key={type} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '.65rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>{val}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'capitalize' }}>{type}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>Salary Overview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem' }}>
                {[['Gross Pay', `$${(u.salary.basic + u.salary.hra + u.salary.conveyance + u.salary.specialAllowance + u.salary.medicalAllowance).toLocaleString()}`], ['Deductions', `-$${(u.salary.pfDeduction + u.salary.taxDeduction + u.salary.professionalTax).toLocaleString()}`], ['Net Salary', `$${u.salary.netSalary.toLocaleString()}`]].map(([l, v]) => (
                  <div key={l} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '.75rem' }}>
                    <p style={{ fontSize: '.72rem', color: 'var(--text-3)', fontWeight: 700 }}>{l}</p>
                    <p style={{ fontWeight: 900, fontSize: '1.1rem', marginTop: '.15rem', color: l === 'Net Salary' ? 'var(--green)' : l === 'Deductions' ? 'var(--red)' : 'var(--text-1)' }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Profile"
          footer={<><button className="btn btn-outline" onClick={() => setEditModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveProfile}>Save Changes</button></>}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={profileForm.name || ''} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Designation</label><input className="form-control" value={profileForm.designation || ''} onChange={e => setProfileForm({ ...profileForm, designation: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={profileForm.phone || ''} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Status</label><select className="form-control" value={profileForm.employmentStatus} onChange={e => setProfileForm({ ...profileForm, employmentStatus: e.target.value as User['employmentStatus'] })}><option>Active</option><option>Probation</option><option>Notice Period</option><option>Inactive</option></select></div>
          </div>
          <div className="form-group"><label className="form-label">Bio</label><textarea className="form-control" rows={3} value={profileForm.bio || ''} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} /></div>
        </Modal>

        {/* Salary Modal */}
        <Modal open={salaryModal} onClose={() => setSalaryModal(false)} title="Update Salary Structure"
          footer={<><button className="btn btn-outline" onClick={() => setSalaryModal(false)}>Cancel</button><button className="btn btn-primary" onClick={() => { if (editUser) { updateSalary(editUser.id, { ...salaryForm, netSalary: computeNet(salaryForm) }); setSalaryModal(false); } }}>Save Salary</button></>}>
          <div className="form-row">
            {[['Basic', 'basic'], ['HRA', 'hra'], ['Conveyance', 'conveyance'], ['Special Allowance', 'specialAllowance'], ['Medical Allowance', 'medicalAllowance'], ['PF Deduction', 'pfDeduction'], ['Income Tax', 'taxDeduction'], ['Professional Tax', 'professionalTax']].map(([label, key]) => (
              <div key={key} className="form-group"><label className="form-label">{label}</label><input type="number" className="form-control" value={(salaryForm as any)[key]} onChange={e => setSalaryForm({ ...salaryForm, [key]: Number(e.target.value) })} /></div>
            ))}
          </div>
          <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 'var(--r-md)', padding: '.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Net Salary (computed)</span>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--green)' }}>${computeNet(salaryForm).toLocaleString()}</span>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Employee Management</h1><p>View, edit, and onboard new employees into the company.</p></div>
          <button className="btn btn-primary" onClick={() => setAddEmpModal(true)}>
            <UserPlus size={16} /> Add New Employee
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem', padding: '.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-icon-wrap" style={{ flex: 1, minWidth: 200 }}>
            <Search size={15} className="input-icon" />
            <input className="form-control" placeholder="Search by name, ID, or role..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
            {['All', ...departments.map(d => d.name)].map(d => <button key={d} className={`btn btn-sm ${deptFilter === d ? 'btn-primary' : 'btn-outline'}`} onClick={() => setDeptFilter(d)}>{d}</button>)}
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Employee</th><th>Department</th><th>Designation</th><th>Status</th><th>Net Salary</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td><div className="emp-cell"><img src={u.avatar} alt="" className="emp-avatar" /><div><div className="emp-name">{u.name}</div><div className="emp-sub">{u.employeeId} · {u.email}</div></div></div></td>
                <td>{u.departmentName}</td>
                <td>{u.designation}</td>
                <td><span className={getBadgeClass(u.employmentStatus)}>{u.employmentStatus}</span></td>
                <td style={{ fontWeight: 700 }}>${u.salary.netSalary.toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '.4rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setSelectedEmployee(u)}><Eye size={13} /> View</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}><Edit3 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Add New Employee */}
      <Modal open={addEmpModal} onClose={() => setAddEmpModal(false)} title="Add New Employee (HR Onboarding)" size="lg"
        footer={<><button className="btn btn-outline" onClick={() => setAddEmpModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreateEmployee}><UserPlus size={15} /> Create Account & Generate ID</button></>}>
        <div style={{ background: 'var(--primary-light)', padding: '.85rem 1rem', borderRadius: 'var(--r-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--primary-mid)' }}>
          <div>
            <span style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--primary-dark)', textTransform: 'uppercase' }}>Auto-Generated Employee ID</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary)' }}>{autoEmpId}</div>
          </div>
          <div style={{ fontSize: '.78rem', color: 'var(--text-3)', textAlign: 'right' }}>
            Generated by Node.js Backend<br />Will be assigned on creation
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-control" placeholder="e.g. Michael Scott" value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Work Email *</label>
            <input className="form-control" type="email" placeholder="e.g. michael.s@dayflow.com" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Password * (Default: join@123)</label>
            <input className="form-control" type="text" value={newEmp.password} onChange={e => setNewEmp({ ...newEmp, password: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Job Designation *</label>
            <input className="form-control" placeholder="e.g. Regional Manager" value={newEmp.designation} onChange={e => setNewEmp({ ...newEmp, designation: e.target.value })} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Department *</label>
            <select className="form-control" value={newEmp.departmentId} onChange={e => {
              const d = departments.find(x => x.id === e.target.value);
              setNewEmp({ ...newEmp, departmentId: e.target.value, departmentName: d?.name || 'Engineering' });
            }}>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Joining Date</label>
            <input className="form-control" type="date" value={newEmp.joinDate} onChange={e => setNewEmp({ ...newEmp, joinDate: e.target.value })} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-control" value={newEmp.phone} onChange={e => setNewEmp({ ...newEmp, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Basic Salary ($)</label>
            <input className="form-control" type="number" value={newEmp.basic} onChange={e => setNewEmp({ ...newEmp, basic: Number(e.target.value) })} />
          </div>
        </div>
      </Modal>
    </div>
  );
};
