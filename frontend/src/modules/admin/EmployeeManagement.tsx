import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal, EmptyState } from '../../ui/components/common';
import { Users, Plus, Edit3, Trash2, Search, Eye, DollarSign, Mail, Phone, MapPin, Briefcase, FileText, UserPlus, Key, Calendar, ShieldCheck, Download, UploadCloud, FileCheck, CheckCircle2, Camera, Image, Upload, Award } from 'lucide-react';
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
  const [newSkillInput, setNewSkillInput] = useState('');

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
    role: 'employee' as User['role'],
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
    skillsString: 'React, Node.js, TypeScript, SQL',
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
    if (!newEmp.name || !newEmp.email) {
      toast('Please enter Full Name and Email Address.', 'error');
      return;
    }
    const selectedDept = departments.find(d => d.id === newEmp.departmentId);
    const skillsList = newEmp.skillsString.split(',').map(s => s.trim()).filter(Boolean);

    await addEmployee({
      ...newEmp,
      departmentName: selectedDept?.name || newEmp.departmentName,
      skills: skillsList,
    });
    setAddEmpModal(false);
    setSearch('');
    setDeptFilter('All');
    setNewEmp({
      name: '', email: '', password: 'join@123', role: 'employee',
      designation: 'Software Engineer', departmentId: departments[0]?.id || 'dept-2', departmentName: departments[0]?.name || 'Engineering',
      phone: '+1 (555) 123-4567', address: 'San Francisco, CA', joinDate: new Date().toISOString().split('T')[0],
      birthDate: '1995-01-01', employmentStatus: 'Active', probationEndDate: '', contractEndDate: '',
      skillsString: 'React, Node.js, TypeScript, SQL', basic: 4500, hra: 1800
    });
  };

  const handleDeleteEmployee = async () => {
    if (deleteConfirmModal) {
      await deleteEmployee(deleteConfirmModal.id);
      setDeleteConfirmModal(null);
    }
  };

  const handleAddSkillToUser = (targetUser: User) => {
    if (!newSkillInput.trim()) return;
    const currentSkills = targetUser.skills || [];
    const skillToAdd = newSkillInput.trim();
    if (currentSkills.includes(skillToAdd)) {
      toast('Skill already exists on this profile', 'info');
      return;
    }
    const updatedSkills = [...currentSkills, skillToAdd];
    updateProfile(targetUser.id, { skills: updatedSkills });
    setNewSkillInput('');
    toast(`Skill "${skillToAdd}" added successfully!`, 'success');
  };

  const handleRemoveSkillFromUser = (targetUser: User, skillToRemove: string) => {
    const currentSkills = targetUser.skills || [];
    const updatedSkills = currentSkills.filter(s => s !== skillToRemove);
    updateProfile(targetUser.id, { skills: updatedSkills });
    toast(`Skill "${skillToRemove}" removed.`, 'info');
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

  // Profile View mode
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

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            {selectedEmployee && (
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedEmployee(null)}>
                ← Back to All Employees
              </button>
            )}
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{isSelf ? 'My Profile & Documents' : `${u.name}'s Employee Profile`}</h2>
          </div>
          {isHRorAdmin && !isSelf && (
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}><Edit3 size={14} /> Edit Profile</button>
              <button className="btn btn-outline btn-sm" onClick={() => openSalary(u)}><DollarSign size={14} /> Update Salary</button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
          {/* Left Column Profile Card */}
          <div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 1rem' }}>
                <img src={u.avatar} alt="" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }} />
                {canUpload && (
                  <button
                    onClick={() => { setPhotoTarget(u); setPreviewAvatar(u.avatar); setPhotoModal(true); }}
                    style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                    title="Change Profile Photo"
                  >
                    <Camera size={15} />
                  </button>
                )}
              </div>
              <h3 style={{ margin: '0 0 .25rem 0' }}>{u.name}</h3>
              <p style={{ fontSize: '.83rem', color: 'var(--text-3)', margin: '0 0 .75rem 0' }}>{u.designation}</p>
              <span className={getBadgeClass(u.employmentStatus)}>{u.employmentStatus}</span>

              <div style={{ margin: '1.25rem 0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '.6rem', fontSize: '.83rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--text-2)' }}>
                  <Briefcase size={15} color="var(--primary)" /> <span>{u.departmentName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--text-2)' }}>
                  <Mail size={15} color="var(--primary)" /> <span>{u.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--text-2)' }}>
                  <Phone size={15} color="var(--primary)" /> <span>{u.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--text-2)' }}>
                  <MapPin size={15} color="var(--primary)" /> <span>{u.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--text-2)' }}>
                  <Calendar size={15} color="var(--primary)" /> <span>Joined {u.joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Docs & Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Skills & Core Competencies Card */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title"><Award size={18} color="var(--primary)" /> Skills & Core Competencies</h3>
                  <p className="card-subtitle">Technical skills, frameworks, and professional competencies.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: canUpload ? '1rem' : 0 }}>
                {(!u.skills || u.skills.length === 0) ? (
                  <p style={{ fontSize: '.83rem', color: 'var(--text-3)', margin: 0 }}>No skills added yet.</p>
                ) : (
                  u.skills.map(skill => (
                    <span
                      key={skill}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '.4rem',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        padding: '.35rem .75rem',
                        borderRadius: '99px',
                        fontSize: '.82rem',
                        fontWeight: 700,
                        border: '1px solid var(--border)'
                      }}
                    >
                      {skill}
                      {canUpload && (
                        <button
                          onClick={() => handleRemoveSkillFromUser(u, skill)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: 900,
                            marginLeft: 2,
                            opacity: 0.8
                          }}
                          title="Remove skill"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>

              {canUpload && (
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add a new skill (e.g. Python, Figma, AWS, Docker)..."
                    value={newSkillInput}
                    onChange={e => setNewSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddSkillToUser(u); }}
                    style={{ fontSize: '.83rem' }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAddSkillToUser(u)}
                    style={{ flexShrink: 0 }}
                  >
                    + Add Skill
                  </button>
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title"><FileText size={18} color="var(--primary)" /> Employee Contracts & Documents</h3>
                  <p className="card-subtitle">Official contracts, NDA agreements, tax forms, and IDs.</p>
                </div>
                {canUpload && (
                  <button className="btn btn-primary btn-sm" onClick={() => { setSelectedFile(null); setNewDoc({ name: '', category: 'Contract', expiryDate: '' }); setAddDocModal(true); }}>
                    <Plus size={14} /> Upload Document
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                {docs.map(d => (
                  <div key={d.id} className="card-flat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                      <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '.5rem', borderRadius: 'var(--r-sm)' }}>
                        <FileCheck size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{d.name}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>
                          Category: <strong>{d.category}</strong> · Uploaded: {d.uploadDate} {d.fileSize ? `· ${d.fileSize}` : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => downloadDocumentFile(d)} title="Download file">
                        <Download size={13} /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compensation Overview */}
            {isHRorAdmin && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title"><DollarSign size={18} color="var(--green)" /> Compensation & Salary Structure</h3>
                  <button className="btn btn-outline btn-sm" onClick={() => openSalary(u)}>Edit Salary</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                  <div><div style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 600 }}>BASIC SALARY</div><div style={{ fontWeight: 700, marginTop: '.2rem' }}>${u.salary.basic.toLocaleString()}</div></div>
                  <div><div style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 600 }}>HRA ALLOWANCE</div><div style={{ fontWeight: 700, marginTop: '.2rem' }}>${u.salary.hra.toLocaleString()}</div></div>
                  <div><div style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 600 }}>SPECIAL ALLOWANCE</div><div style={{ fontWeight: 700, marginTop: '.2rem' }}>${u.salary.specialAllowance.toLocaleString()}</div></div>
                  <div><div style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 600 }}>PF DEDUCTION</div><div style={{ fontWeight: 700, marginTop: '.2rem', color: 'var(--red)' }}>-${u.salary.pfDeduction.toLocaleString()}</div></div>
                  <div><div style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 600 }}>TAX DEDUCTION</div><div style={{ fontWeight: 700, marginTop: '.2rem', color: 'var(--red)' }}>-${u.salary.taxDeduction.toLocaleString()}</div></div>
                  <div style={{ gridColumn: '1 / -1', background: 'var(--surface-2)', padding: '.75rem 1rem', borderRadius: 'var(--r-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '.9rem' }}>MONTHLY NET TAKE-HOME</span>
                    <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--green)' }}>${u.salary.netSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Photo Modal */}
        <Modal open={photoModal} onClose={() => setPhotoModal(false)} title="Update Profile Photo" size="sm"
          footer={<><button className="btn btn-outline" onClick={() => setPhotoModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveAvatar} disabled={!previewAvatar}><CheckCircle2 size={14} /> Save Photo</button></>}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <img src={previewAvatar || photoTarget?.avatar} alt="Preview" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)', margin: '0 auto .75rem' }} />
            <p style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>Upload a picture or choose a standard avatar preset.</p>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Upload Custom Image File</label>
            <input type="file" accept="image/*" className="form-control" onChange={handleAvatarFileChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Or Choose Preset Avatar</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.5rem', marginTop: '.35rem' }}>
              {PRESET_AVATARS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Avatar ${i}`}
                  onClick={() => setPreviewAvatar(url)}
                  style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: previewAvatar === url ? '3px solid var(--accent)' : '2px solid transparent' }}
                />
              ))}
            </div>
          </div>
        </Modal>

        {/* Add Document Modal */}
        <Modal open={addDocModal} onClose={() => setAddDocModal(false)} title="Upload Employee Document"
          footer={<><button className="btn btn-outline" onClick={() => setAddDocModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddDocument}><UploadCloud size={14} /> Complete Upload</button></>}>
          <div className="form-group">
            <label className="form-label">Select Document File</label>
            <input type="file" className="form-control" onChange={handleFileChange} />
            {selectedFile && <div style={{ fontSize: '.75rem', color: 'var(--green)', marginTop: '.25rem', fontWeight: 600 }}>Selected: {selectedFile.name} ({selectedFile.size})</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Document Display Name</label>
            <input className="form-control" placeholder="e.g. Executive_Employment_Agreement.pdf" value={newDoc.name} onChange={e => setNewDoc({ ...newDoc, name: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Document Category</label>
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
      </div>
    );
  }

  // Calculate net pay preview for newEmp form
  const previewBasic = Number(newEmp.basic) || 4500;
  const previewHra = Number(newEmp.hra) || 1800;
  const previewNet = previewBasic + previewHra + 400 + 1000 + 300 - (Math.round(previewBasic * 0.12) + Math.round((previewBasic + previewHra + 1700) * 0.1) + 200);

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

      {/* Onboard Employee Full Executive Modal */}
      <Modal open={addEmpModal} onClose={() => setAddEmpModal(false)} title="Onboard New Employee" size="lg"
        footer={<><button className="btn btn-outline" onClick={() => setAddEmpModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreateEmployee}><UserPlus size={15} /> Create & Save Employee</button></>}>
        
        <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '.65rem .85rem', borderRadius: 'var(--r-md)', marginBottom: '1.25rem', fontSize: '.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Key size={15} /> Auto-Assigned Employee ID: <strong>{autoEmpId}</strong></span>
          <span style={{ fontSize: '.75rem', opacity: .8 }}>Default Login Password: <code>{newEmp.password}</code></span>
        </div>

        {/* Section 1: Identity & System Access */}
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-3)', marginBottom: '.65rem', borderBottom: '1px solid var(--border)', paddingBottom: '.3rem' }}>
            1. Identity & Credentials
          </h4>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" placeholder="e.g. Johnathan Vance" value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Email Address *</label><input className="form-control" type="email" placeholder="johnathan@dayflow.com" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">System Role</label>
              <select className="form-control" value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value as User['role'] })}>
                <option value="employee">Employee (Self-Service Portal)</option>
                <option value="admin">HR / Admin Officer</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Initial Password</label><input className="form-control" value={newEmp.password} onChange={e => setNewEmp({ ...newEmp, password: e.target.value })} /></div>
          </div>
        </div>

        {/* Section 2: Position & Contract Details */}
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-3)', marginBottom: '.65rem', borderBottom: '1px solid var(--border)', paddingBottom: '.3rem' }}>
            2. Position & Employment Contract
          </h4>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Designation / Title</label><input className="form-control" placeholder="Senior Full Stack Engineer" value={newEmp.designation} onChange={e => setNewEmp({ ...newEmp, designation: e.target.value })} /></div>
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
              <label className="form-label">Employment Status / Contract</label>
              <select className="form-control" value={newEmp.employmentStatus} onChange={e => setNewEmp({ ...newEmp, employmentStatus: e.target.value as User['employmentStatus'] })}>
                <option value="Active">Active (Full-Time Permanent)</option>
                <option value="Probation">Probationary Period</option>
                <option value="Notice Period">Notice Period</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          {newEmp.employmentStatus === 'Probation' && (
            <div className="form-group">
              <label className="form-label">Probation End Date</label>
              <input className="form-control" type="date" value={newEmp.probationEndDate} onChange={e => setNewEmp({ ...newEmp, probationEndDate: e.target.value })} />
            </div>
          )}
        </div>

        {/* Section 3: Contact & Skills */}
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-3)', marginBottom: '.65rem', borderBottom: '1px solid var(--border)', paddingBottom: '.3rem' }}>
            3. Contact & Technical Skills
          </h4>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Phone Number</label><input className="form-control" placeholder="+1 (555) 000-0000" value={newEmp.phone} onChange={e => setNewEmp({ ...newEmp, phone: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Date of Birth</label><input className="form-control" type="date" value={newEmp.birthDate} onChange={e => setNewEmp({ ...newEmp, birthDate: e.target.value })} /></div>
          </div>
          <div className="form-group" style={{ marginBottom: '.75rem' }}>
            <label className="form-label">Office / Residential Address</label>
            <input className="form-control" placeholder="1088 Market St, San Francisco, CA" value={newEmp.address} onChange={e => setNewEmp({ ...newEmp, address: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Skills & Competencies (comma-separated)</label>
            <input className="form-control" placeholder="React, Node.js, TypeScript, SQL, AWS" value={newEmp.skillsString} onChange={e => setNewEmp({ ...newEmp, skillsString: e.target.value })} />
          </div>
        </div>

        {/* Section 4: Initial Compensation Setup */}
        <div>
          <h4 style={{ fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-3)', marginBottom: '.65rem', borderBottom: '1px solid var(--border)', paddingBottom: '.3rem' }}>
            4. Monthly Salary Setup
          </h4>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Basic Monthly Pay ($)</label><input className="form-control" type="number" value={newEmp.basic} onChange={e => setNewEmp({ ...newEmp, basic: Number(e.target.value) })} /></div>
            <div className="form-group"><label className="form-label">HRA Allowance ($)</label><input className="form-control" type="number" value={newEmp.hra} onChange={e => setNewEmp({ ...newEmp, hra: Number(e.target.value) })} /></div>
          </div>
          <div style={{ background: 'var(--surface-2)', padding: '.75rem 1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text-2)' }}>Estimated Net Monthly Take-Home:</span>
            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--green)' }}>${previewNet.toLocaleString()} / mo</span>
          </div>
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title={`Edit ${editUser?.name}`} size="md"
        footer={<><button className="btn btn-outline" onClick={() => setEditModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveProfile}>Save Changes</button></>}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={profileForm.name || ''} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Designation</label><input className="form-control" value={profileForm.designation || ''} onChange={e => setProfileForm({ ...profileForm, designation: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={profileForm.phone || ''} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Birth Date</label><input className="form-control" type="date" value={profileForm.birthDate || ''} onChange={e => setProfileForm({ ...profileForm, birthDate: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Address</label><input className="form-control" value={profileForm.address || ''} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} /></div>
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

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteConfirmModal} onClose={() => setDeleteConfirmModal(null)} title="Confirm Employee Removal" size="sm"
        footer={<><button className="btn btn-outline" onClick={() => setDeleteConfirmModal(null)}>Cancel</button><button className="btn btn-danger" onClick={handleDeleteEmployee}><Trash2 size={14} /> Confirm Delete</button></>}>
        <p style={{ fontSize: '.9rem', color: 'var(--text-2)' }}>
          Are you sure you want to delete employee <strong>{deleteConfirmModal?.name}</strong> ({deleteConfirmModal?.employeeId})? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
