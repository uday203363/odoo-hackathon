import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal, EmptyState } from '../../ui/components/common';
import { Users, Plus, Edit3, Trash2, Search, Eye, DollarSign, Mail, Phone, MapPin, Briefcase, FileText, UserPlus, Key, Calendar, ShieldCheck, Download, UploadCloud, FileCheck, CheckCircle2, Camera, Image, Upload } from 'lucide-react';
import type { User, Document } from '../../types';
import { downloadDocumentFile } from '../../utils/exportUtils';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
];

export const EmployeeManagement: React.FC = () => {
  const { users, departments, currentUser, activeTab, updateProfile, updateSalary, setSelectedEmployee, selectedEmployee, addEmployee, deleteEmployee, toast } = useApp();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [editModal, setEditModal] = useState(false);
  const [salaryModal, setSalaryModal] = useState(false);
  const [addEmpModal, setAddEmpModal] = useState(false);
  const [addDocModal, setAddDocModal] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);
  const [photoTarget, setPhotoTarget] = useState<User | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string>('');
  const [avatarUrlInput, setAvatarUrlInput] = useState<string>('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  // Forms
  const [profileForm, setProfileForm] = useState<Partial<User>>({});
  const [salaryForm, setSalaryForm] = useState<User['salary']>({ basic: 0, hra: 0, conveyance: 0, specialAllowance: 0, medicalAllowance: 0, pfDeduction: 0, taxDeduction: 0, professionalTax: 0, netSalary: 0 });
  const [newDoc, setNewDoc] = useState<{ name: string; category: Document['category']; expiryDate: string }>({ name: '', category: 'Contract', expiryDate: '' });
  const [selectedFile, setSelectedFile] = useState<{ name: string; data: string; size: string } | null>(null);

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

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreviewAvatar(base64);
      setProfileForm(p => ({ ...p, avatar: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = () => {
    const target = photoTarget || selectedEmployee || (activeTab === 'profile' ? currentUser : editUser);
    if (!target || !previewAvatar) return;
    updateProfile(target.id, { avatar: previewAvatar });
    setPhotoModal(false);
    setPhotoTarget(null);
    setPreviewAvatar('');
    setAvatarUrlInput('');
    toast('Profile photo updated successfully!', 'success');
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setProfileForm({
      name: u.name,
      avatar: u.avatar,
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

  const handleSaveProfile = () => {
    if (editUser) {
      updateProfile(editUser.id, profileForm);
      setEditModal(false);
    }
  };
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
      setSelectedFile({ name: file.name, data: base64Data, size: sizeStr });
      if (!newDoc.name) {
        setNewDoc(prev => ({ ...prev, name: file.name }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddDocument = () => {
    const target = selectedEmployee || (activeTab === 'profile' ? currentUser : editUser);
    if (!target) return;
    const docName = newDoc.name.trim() || selectedFile?.name || `${target.name.replace(/\s+/g, '_')}_Document.pdf`;
    const docItem: Document = {
      id: `doc-${Date.now()}`,
      name: docName,
      category: newDoc.category,
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: newDoc.expiryDate || undefined,
      fileData: selectedFile?.data,
      fileSize: selectedFile?.size || '154 KB',
      uploadedBy: currentUser.name,
      acknowledged: true
    };
    const currentDocs: Document[] = target.documents && target.documents.length > 0 ? target.documents : [
      { id: 'doc-1', name: `${target.name.replace(/\s+/g, '_')}_Employment_Contract.pdf`, category: 'Contract' as Document['category'], uploadDate: target.joinDate, acknowledged: true },
      { id: 'doc-2', name: `${target.name.replace(/\s+/g, '_')}_NDA_Agreement.pdf`, category: 'Contract' as Document['category'], uploadDate: target.joinDate, acknowledged: true },
      { id: 'doc-3', name: `${target.name.replace(/\s+/g, '_')}_Tax_W4_Form.pdf`, category: 'Tax Form' as Document['category'], uploadDate: target.joinDate, acknowledged: true },
    ];
    const updatedDocs: Document[] = [docItem, ...currentDocs];
    updateProfile(target.id, { documents: updatedDocs });
    setAddDocModal(false);
    setNewDoc({ name: '', category: 'Contract', expiryDate: '' });
    setSelectedFile(null);
    toast(`Document "${docName}" uploaded successfully!`, 'success');
  };

  // Profile View mode (either if employee selected, or activeTab === 'profile')
  const displayUser = selectedEmployee || (activeTab === 'profile' ? currentUser : null);

  if (displayUser) {
    const u = displayUser;
    const isSelf = u.id === currentUser.id;
    const isHRorAdmin = currentUser.role === 'admin' || currentUser.role === 'hr' || currentUser.role === 'super_admin';
    const canUpload = isHRorAdmin || isSelf;

    const docs: Document[] = u.documents && u.documents.length > 0 ? u.documents : [
      { id: 'doc-1', name: `${u.name.replace(/\s+/g, '_')}_Employment_Contract.pdf`, category: 'Contract' as Document['category'], uploadDate: u.joinDate, acknowledged: true },
      { id: 'doc-2', name: `${u.name.replace(/\s+/g, '_')}_NDA_Agreement.pdf`, category: 'Contract' as Document['category'], uploadDate: u.joinDate, acknowledged: true },
      { id: 'doc-3', name: `${u.name.replace(/\s+/g, '_')}_Tax_W4_Form.pdf`, category: 'Tax Form' as Document['category'], uploadDate: u.joinDate, acknowledged: true },
    ];

    const handleDeleteDoc = (docId: string, docName: string) => {
      const updated = (u.documents || docs).filter(d => d.id !== docId);
      updateProfile(u.id, { documents: updated });
      toast(`Removed document: ${docName}`, 'info');
    };

    return (
      <div>
        <div className="page-header">
          <div className="page-header-row">
            <div><h1>{isSelf ? 'My Profile' : 'Employee Profile'}</h1></div>
            <div style={{ display: 'flex', gap: '.6rem' }}>
              {!isSelf && <button className="btn btn-outline" onClick={() => setSelectedEmployee(null)}>← Back to List</button>}
              <button className="btn btn-outline" onClick={() => openEdit(u)}><Edit3 size={14} /> Edit Profile</button>
              {isHRorAdmin && <button className="btn btn-primary" onClick={() => openSalary(u)}><DollarSign size={14} /> Salary Structure</button>}
              {isHRorAdmin && !isSelf && (
                <button className="btn btn-danger" onClick={() => setDeleteConfirmModal(u)}><Trash2 size={14} /> Delete Account</button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', alignItems: 'start' }}>
          {/* Left Column: Avatar & Basic Details */}
          <div className="card" style={{ textAlign: 'center' }}>
            {/* Interactive Avatar with Camera Edit Badge */}
            <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto .75rem' }}>
              <img
                src={u.avatar}
                alt={u.name}
                style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)', boxShadow: 'var(--shadow-sm)' }}
              />
              {canUpload && (
                <button
                  onClick={() => {
                    setPhotoTarget(u);
                    setPreviewAvatar(u.avatar);
                    setAvatarUrlInput('');
                    setPhotoModal(true);
                  }}
                  style={{
                    position: 'absolute', bottom: 0, right: 0, width: 32, height: 32,
                    borderRadius: '50%', background: 'var(--primary)', color: '#fff',
                    border: '2.5px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: 'var(--shadow-md)', transition: 'transform .15s ease'
                  }}
                  title="Change Profile Photo"
                >
                  <Camera size={15} />
                </button>
              )}
            </div>

            <h2 style={{ fontWeight: 800 }}>{u.name} {isSelf && <span style={{ fontSize: '.78rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 99, fontWeight: 700, marginLeft: 4 }}>(You)</span>}</h2>
            <p style={{ color: 'var(--text-3)', fontSize: '.87rem', marginTop: '.15rem' }}>{u.designation}</p>
            
            {canUpload && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginTop: '.4rem', fontSize: '.76rem', color: 'var(--primary)' }}
                onClick={() => {
                  setPhotoTarget(u);
                  setPreviewAvatar(u.avatar);
                  setAvatarUrlInput('');
                  setPhotoModal(true);
                }}
              >
                <Camera size={13} /> Edit Profile Photo
              </button>
            )}

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
                    <FileText size={18} color="var(--accent)" /> Contracts & Official Documents
                  </h3>
                  <p className="card-subtitle">Employee employment agreements, tax certificates, and verified documents.</p>
                </div>
                {canUpload && (
                  <button className="btn btn-primary btn-sm" onClick={() => { setSelectedFile(null); setAddDocModal(true); }}>
                    <UploadCloud size={14} /> Upload Document
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                {docs.map(doc => (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.85rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--surface-2)', gap: '.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flex: 1, minWidth: '220px' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '.86rem', color: 'var(--text-1)' }}>{doc.name}</div>
                        <div style={{ fontSize: '.74rem', color: 'var(--text-3)', marginTop: '2px' }}>
                          {doc.category} · Uploaded: {doc.uploadDate} {doc.fileSize ? `(${doc.fileSize})` : ''} {doc.uploadedBy ? `by ${doc.uploadedBy}` : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <span className="badge badge-active">
                        <CheckCircle2 size={11} /> Signed & Verified
                      </span>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={async () => {
                          toast(`Downloading ${doc.name}...`, 'info');
                          await downloadDocumentFile(doc, u);
                          toast(`Downloaded ${doc.name} successfully!`, 'success');
                        }}
                        title="Download Document Locally"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Download size={13} /> Download
                      </button>
                      {canUpload && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--red)', padding: '4px 7px' }}
                          onClick={() => handleDeleteDoc(doc.id, doc.name)}
                          title="Delete Document"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
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
        <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Profile & Details"
          footer={<><button className="btn btn-outline" onClick={() => setEditModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveProfile}>Save Changes</button></>}>
          
          {/* Profile Photo Edit Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.85rem', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', marginBottom: '1rem' }}>
            <img
              src={profileForm.avatar || editUser?.avatar}
              alt=""
              style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }}
            />
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ marginBottom: 4 }}>Profile Photo</label>
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Camera size={13} /> Choose Image
                  <input type="file" accept="image/*" onChange={handleAvatarFileChange} style={{ display: 'none' }} />
                </label>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    if (editUser) {
                      setPhotoTarget(editUser);
                      setPreviewAvatar(profileForm.avatar || editUser.avatar);
                      setPhotoModal(true);
                    }
                  }}
                >
                  <Image size={13} /> Select from Presets / URL
                </button>
              </div>
            </div>
          </div>

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

        {/* Dedicated Update Profile Photo Modal */}
        <Modal
          open={photoModal}
          onClose={() => { setPhotoModal(false); setPreviewAvatar(''); setAvatarUrlInput(''); }}
          title="Update Profile Photo"
          size="sm"
          footer={
            <>
              <button className="btn btn-outline" onClick={() => { setPhotoModal(false); setPreviewAvatar(''); setAvatarUrlInput(''); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveAvatar} disabled={!previewAvatar}>
                <Camera size={14} /> Save Profile Photo
              </button>
            </>
          }
        >
          {/* Live Preview */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto .5rem' }}>
              <img
                src={previewAvatar || photoTarget?.avatar || currentUser.avatar}
                alt="Preview"
                style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: 'var(--shadow-md)' }}
              />
            </div>
            <p style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>Live Photo Preview</p>
          </div>

          {/* Option 1: File Upload */}
          <div className="form-group">
            <label className="form-label">Upload From Device</label>
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
              border: '2px dashed var(--border-strong)', borderRadius: 'var(--r-md)', padding: '.85rem',
              cursor: 'pointer', background: 'var(--surface-2)', transition: 'border-color .18s ease'
            }}>
              <Upload size={16} color="var(--primary)" />
              <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--primary)' }}>Choose Local Image</span>
              <input type="file" accept="image/*" onChange={handleAvatarFileChange} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Option 2: Image URL */}
          <div className="form-group">
            <label className="form-label">Or Enter Image URL</label>
            <div style={{ display: 'flex', gap: '.4rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={avatarUrlInput}
                onChange={e => {
                  setAvatarUrlInput(e.target.value);
                  if (e.target.value.trim()) setPreviewAvatar(e.target.value.trim());
                }}
              />
            </div>
          </div>

          {/* Option 3: Quick Presets */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Or Select from Professional Presets</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.6rem', marginTop: '.35rem' }}>
              {PRESET_AVATARS.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Preset ${idx + 1}`}
                  onClick={() => setPreviewAvatar(url)}
                  style={{
                    width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer',
                    border: previewAvatar === url ? '3px solid var(--primary)' : '2px solid var(--border)',
                    transform: previewAvatar === url ? 'scale(1.08)' : 'none',
                    transition: 'transform .15s ease, border-color .15s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </Modal>

        {/* Upload Document Modal */}
        <Modal open={addDocModal} onClose={() => setAddDocModal(false)} title="Upload Official Document / Contract" size="sm"
          footer={<><button className="btn btn-outline" onClick={() => setAddDocModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddDocument}><UploadCloud size={14} /> Upload Document</button></>}>
          
          {/* File Picker Box */}
          <div className="form-group">
            <label className="form-label">Select File From Computer</label>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '2px dashed var(--border-strong)', borderRadius: 'var(--r-md)', padding: '1.25rem 1rem',
              cursor: 'pointer', background: 'var(--surface-2)', transition: 'border-color .2s ease'
            }}>
              <UploadCloud size={24} color="var(--primary)" style={{ marginBottom: 6 }} />
              <span style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--primary)' }}>
                {selectedFile ? selectedFile.name : 'Choose File to Upload'}
              </span>
              <span style={{ fontSize: '.72rem', color: 'var(--text-3)', marginTop: 2 }}>
                {selectedFile ? `File size: ${selectedFile.size}` : 'Supports PDF, DOCX, PNG, JPG, TXT'}
              </span>
              <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg" />
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Document Title / Name *</label>
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

          <div className="form-group">
            <label className="form-label">Expiry Date (Optional)</label>
            <input type="date" className="form-control" value={newDoc.expiryDate} onChange={e => setNewDoc({ ...newDoc, expiryDate: e.target.value })} />
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
