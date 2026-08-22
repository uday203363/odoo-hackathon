import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal, EmptyState } from '../../ui/components/common';
import { Users, Plus, Edit3, Trash2, Search, Eye, DollarSign, Mail, Phone, MapPin, Briefcase, FileText, UserPlus, Key, Calendar, ShieldCheck, Download, UploadCloud } from 'lucide-react';
import type { User, Document } from '../../types';

export const EmployeeManagement: React.FC = () => {
  const { users, departments, currentUser, activeTab, updateProfile, updateSalary, setSelectedEmployee, selectedEmployee, addEmployee, deleteEmployee, toast } = useApp();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [editModal, setEditModal] = useState(false);
  const [salaryModal, setSalaryModal] = useState(false);
  const [addEmpModal, setAddEmpModal] = useState(false);
  const [addDocModal, setAddDocModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  // Forms
  const [profileForm, setProfileForm] = useState<Partial<User>>({});
  const [salaryForm, setSalaryForm] = useState<User['salary']>({ basic: 0, hra: 0, conveyance: 0, specialAllowance: 0, medicalAllowance: 0, pfDeduction: 0, taxDeduction: 0, professionalTax: 0, netSalary: 0 });
  const [newDoc, setNewDoc] = useState({ name: '', category: 'Contract' as Document['category'] });

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
    birthDate: '1995-01-01',
    employmentStatus: 'Active' as User['employmentStatus'],
    probationEndDate: '',
    contractEndDate: '',
    basic: 4500,
    hra: 1800,
  });

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(s) || u.employeeId.toLowerCase().includes(s) || u.designation.toLowerCase().includes(s);
    const matchDept = deptFilter === 'All' || u.departmentName === deptFilter;
    return matchSearch && matchDept;
  });

  const openEdit = (u: User) => {
    setEditUser(u);
    setProfileForm({
      name: u.name,
      designation: u.designation,
      phone: u.phone,
      address: u.address,
      bio: u.bio,
      birthDate: u.birthDate,
      departmentId: u.departmentId,
      departmentName: u.departmentName,
      employmentStatus: u.employmentStatus,
      probationEndDate: u.probationEndDate || '',
      contractEndDate: u.contractEndDate || '',
    });
    setEditModal(true);
  };

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
    setSearch('');
    setDeptFilter('All');
    setNewEmp({ name: '', email: '', password: 'join@123', designation: 'Software Engineer', departmentId: departments[0]?.id || 'dept-2', departmentName: departments[0]?.name || 'Engineering', phone: '+1 (555) 123-4567', address: 'San Francisco, CA', joinDate: new Date().toISOString().split('T')[0], birthDate: '1995-01-01', employmentStatus: 'Active', probationEndDate: '', contractEndDate: '', basic: 4500, hra: 1800 });
  };

  const handleDeleteEmployee = async () => {
    if (deleteConfirmModal) {
      await deleteEmployee(deleteConfirmModal.id);
      setDeleteConfirmModal(null);
    }
  };

  const handleAddDocument = () => {
    const target = selectedEmployee || editUser;
    if (!target || !newDoc.name) return;
    const docItem: Document = {
      id: `doc-${Date.now()}`,
      name: newDoc.name,
      category: newDoc.category,
      uploadDate: new Date().toISOString().split('T')[0],
      acknowledged: true
    };
    const updatedDocs = [...(target.documents || []), docItem];
    updateProfile(target.id, { documents: updatedDocs });
    setAddDocModal(false);
    setNewDoc({ name: '', category: 'Contract' });
    toast(`Added document ${newDoc.name} to employee profile.`, 'success');
  };

  // Profile View mode (either if employee selected, or activeTab === 'profile')
  const displayUser = selectedEmployee || (activeTab === 'profile' ? currentUser : null);

  if (displayUser) {
    const u = displayUser;
    const isSelf = u.id === currentUser.id;
    const docs = u.documents && u.documents.length > 0 ? u.documents : [
      { id: 'doc-1', name: `${u.name.replace(/\s+/g, '_')}_Employment_Contract.pdf`, category: 'Contract', uploadDate: u.joinDate, acknowledged: true },
      { id: 'doc-2', name: `${u.name.replace(/\s+/g, '_')}_NDA_Agreement.pdf`, category: 'Contract', uploadDate: u.joinDate, acknowledged: true },
      { id: 'doc-3', name: `${u.name.replace(/\s+/g, '_')}_Tax_W4_Form.pdf`, category: 'Tax Form', uploadDate: u.joinDate, acknowledged: true },
    ];

    return (
      <div>
        <div className="page-header">
          <div className="page-header-row">
            <div><h1>{isSelf ? 'My Profile' : 'Employee Profile'}</h1></div>
            <div style={{ display: 'flex', gap: '.6rem' }}>
              {!isSelf && <button className="btn btn-outline" onClick={() => setSelectedEmployee(null)}>← Back to List</button>}
              <button className="btn btn-outline" onClick={() => openEdit(u)}><Edit3 size={14} /> Edit Profile</button>
              {currentUser.role === 'admin' && <button className="btn btn-primary" onClick={() => openSalary(u)}><DollarSign size={14} /> Salary Structure</button>}
              {currentUser.role === 'admin' && !isSelf && (
                <button className="btn btn-danger" onClick={() => setDeleteConfirmModal(u)}><Trash2 size={14} /> Delete Account</button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', alignItems: 'start' }}>
          {/* Left Column: Avatar & Basic Details */}
          <div className="card" style={{ textAlign: 'center' }}>
            <img src={u.avatar} alt="" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem', border: '3px solid var(--primary-light)' }} />
            <h2 style={{ fontWeight: 800 }}>{u.name} {isSelf && <span style={{ fontSize: '.78rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 99, fontWeight: 700, marginLeft: 4 }}>(You)</span>}</h2>
            <p style={{ color: 'var(--text-3)', fontSize: '.87rem', marginTop: '.15rem' }}>{u.designation}</p>
            <div style={{ marginTop: '.75rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              <span className={getBadgeClass(u.employmentStatus)} style={{ alignSelf: 'center' }}>{u.employmentStatus}</span>
              <span style={{ fontWeight: 700, fontSize: '.83rem', color: 'var(--primary)' }}>{u.employeeId}</span>
            </div>
            {u.bio && <p style={{ marginTop: '1rem', fontSize: '.82rem', color: 'var(--text-3)', lineHeight: 1.6 }}>{u.bio}</p>}
            {u.skills && <div style={{ marginTop: '.85rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>{u.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}</div>}
          </div>

          {/* Right Column: Contract, Leave, Salary, Documents */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Employment & Contract Details */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={18} color="var(--primary)" /> Contract & Employment Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.85rem' }}>
                {[
                  ['Contract Status', u.employmentStatus],
                  ['Department', u.departmentName],
                  ['Contract Type', 'Full-Time Employment Agreement'],
                  ['Joining Date', u.joinDate],
                  ['Probation End Date', u.probationEndDate || (u.employmentStatus === 'Probation' ? '2026-11-30' : 'Completed')],
                  ['Contract Expiry / Renewal', u.contractEndDate || 'Permanent / Open-Ended'],
                  ['Email', u.email],
                  ['Phone', u.phone]
                ].map(([l, v]) => (
                  <div key={l} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '.75rem' }}>
                    <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{l}</p>
                    <p style={{ fontWeight: 700, fontSize: '.87rem', marginTop: '.2rem', color: l === 'Contract Status' ? 'var(--primary)' : 'var(--text-1)' }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contracts & Signed Documents */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={18} color="var(--accent)" /> Contracts & Documents
                  </h3>
                  <p className="card-subtitle">Employee employment agreement and tax certificates.</p>
                </div>
                {currentUser.role === 'admin' && (
                  <button className="btn btn-outline btn-sm" onClick={() => setAddDocModal(true)}>
                    <UploadCloud size={13} /> Upload Document
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {docs.map(doc => (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--surface-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', flex: 1 }}>
                      <FileText size={18} color="var(--primary)" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '.84rem' }}>{doc.name}</div>
                        <div style={{ fontSize: '.73rem', color: 'var(--text-3)' }}>{doc.category} · Uploaded: {doc.uploadDate}</div>
                      </div>
                    </div>
                    <span className="badge badge-active" style={{ marginRight: 10 }}>Signed & Active</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => toast(`Downloading ${doc.name}...`, 'info')}>
                      <Download size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Balances */}
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

            {/* Salary Overview */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>Salary Overview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem' }}>
                {[
                  ['Gross Pay', `$${(u.salary.basic + u.salary.hra + u.salary.conveyance + u.salary.specialAllowance + u.salary.medicalAllowance).toLocaleString()}`],
                  ['Deductions', `-$${(u.salary.pfDeduction + u.salary.taxDeduction + u.salary.professionalTax).toLocaleString()}`],
                  ['Net Salary', `$${u.salary.netSalary.toLocaleString()}`]
                ].map(([l, v]) => (
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
        <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Profile & Contract Details"
          footer={<><button className="btn btn-outline" onClick={() => setEditModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveProfile}>Save Changes</button></>}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={profileForm.name || ''} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Designation</label><input className="form-control" value={profileForm.designation || ''} onChange={e => setProfileForm({ ...profileForm, designation: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Date of Birth (DOB)</label><input className="form-control" type="date" value={profileForm.birthDate || ''} onChange={e => setProfileForm({ ...profileForm, birthDate: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={profileForm.phone || ''} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contract Status</label>
              <select className="form-control" value={profileForm.employmentStatus} onChange={e => setProfileForm({ ...profileForm, employmentStatus: e.target.value as User['employmentStatus'] })}>
                <option>Active</option>
                <option>Probation</option>
                <option>Notice Period</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Probation End Date</label>
              <input className="form-control" type="date" value={profileForm.probationEndDate || ''} onChange={e => setProfileForm({ ...profileForm, probationEndDate: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Contract Renewal / Expiry Date</label>
            <input className="form-control" type="date" value={profileForm.contractEndDate || ''} onChange={e => setProfileForm({ ...profileForm, contractEndDate: e.target.value })} />
          </div>
          <div className="form-group"><label className="form-label">Bio</label><textarea className="form-control" rows={3} value={profileForm.bio || ''} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} /></div>
        </Modal>

        {/* Upload Document Modal */}
        <Modal open={addDocModal} onClose={() => setAddDocModal(false)} title="Upload Contract Document" size="sm"
          footer={<><button className="btn btn-outline" onClick={() => setAddDocModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddDocument}>Upload Document</button></>}>
          <div className="form-group">
            <label className="form-label">Document Name *</label>
            <input className="form-control" placeholder="e.g. Senior_Engineer_Agreement.pdf" value={newDoc.name} onChange={e => setNewDoc({ ...newDoc, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" value={newDoc.category} onChange={e => setNewDoc({ ...newDoc, category: e.target.value as Document['category'] })}>
              <option>Contract</option>
              <option>ID Proof</option>
              <option>Tax Form</option>
              <option>Certificate</option>
              <option>Policy</option>
            </select>
          </div>
        </Modal>

        {/* Delete Confirm Modal */}
        <Modal open={!!deleteConfirmModal} onClose={() => setDeleteConfirmModal(null)} title="Confirm Employee Removal" size="sm"
          footer={<><button className="btn btn-outline" onClick={() => setDeleteConfirmModal(null)}>Cancel</button><button className="btn btn-danger" onClick={handleDeleteEmployee}><Trash2 size={14} /> Confirm Delete</button></>}>
          <p style={{ fontSize: '.9rem', color: 'var(--text-2)' }}>
            Are you sure you want to delete employee <strong>{deleteConfirmModal?.name}</strong> ({deleteConfirmModal?.employeeId})? This action cannot be undone.
          </p>
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
            <UserPlus size={16} /> Onboard New Employee
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div className="input-icon-wrap" style={{ flex: 1, minWidth: 220 }}>
          <Search size={16} className="input-icon" />
          <input className="form-control" placeholder="Search by name, ID, designation..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 180 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="All">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Status</th>
              <th>Joining Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="emp-cell">
                    <img src={u.avatar} alt="" className="emp-avatar" />
                    <div>
                      <div className="emp-name">{u.name}</div>
                      <div className="emp-sub">{u.designation}</div>
                    </div>
                  </div>
                </td>
                <td><strong style={{ color: 'var(--primary)' }}>{u.employeeId}</strong></td>
                <td>{u.departmentName}</td>
                <td><span className={getBadgeClass(u.employmentStatus)}>{u.employmentStatus}</span></td>
                <td>{u.joinDate}</td>
                <td>
                  <div style={{ display: 'flex', gap: '.4rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setSelectedEmployee(u)} title="View Contract & Profile">
                      <Eye size={13} /> View
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)} title="Edit Details">
                      <Edit3 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Onboard Employee Modal */}
      <Modal open={addEmpModal} onClose={() => setAddEmpModal(false)} title="Onboard New Employee"
        footer={<><button className="btn btn-outline" onClick={() => setAddEmpModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreateEmployee}><UserPlus size={15} /> Create Employee</button></>}>
        <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '.65rem .85rem', borderRadius: 'var(--r-md)', marginBottom: '1rem', fontSize: '.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Key size={14} /> Assigned Employee ID: {autoEmpId}
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Email Address *</label><input className="form-control" type="email" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Designation</label><input className="form-control" value={newEmp.designation} onChange={e => setNewEmp({ ...newEmp, designation: e.target.value })} /></div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-control" value={newEmp.departmentId} onChange={e => setNewEmp({ ...newEmp, departmentId: e.target.value })}>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Joining Date</label><input className="form-control" type="date" value={newEmp.joinDate} onChange={e => setNewEmp({ ...newEmp, joinDate: e.target.value })} /></div>
          <div className="form-group">
            <label className="form-label">Contract Status</label>
            <select className="form-control" value={newEmp.employmentStatus} onChange={e => setNewEmp({ ...newEmp, employmentStatus: e.target.value as User['employmentStatus'] })}>
              <option>Active</option><option>Probation</option><option>Notice Period</option><option>Inactive</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};
