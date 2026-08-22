import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, FileText, Phone, Mail, MapPin, Calendar, Building, DollarSign, Edit, Save, ArrowLeft, Upload } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, selectedEmployeeForView, setSelectedEmployeeForView, updateUserProfile, updateEmployeeSalary } = useApp();
  
  // Target employee to display (either selected by admin or current user)
  const targetUser = selectedEmployeeForView || currentUser;
  const isAdmin = currentUser.role === 'admin';

  const [activeTab, setActiveTab] = useState<'personal' | 'job' | 'salary' | 'documents'>('personal');
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: targetUser.name,
    email: targetUser.email,
    phone: targetUser.phone,
    address: targetUser.address,
    bio: targetUser.bio || '',
    avatar: targetUser.avatar,
    designation: targetUser.designation,
    department: targetUser.department,
    managerName: targetUser.managerName || '',
  });

  const [salaryForm, setSalaryForm] = useState({ ...targetUser.salary });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(targetUser.id, formData);
    if (isAdmin) {
      updateEmployeeSalary(targetUser.id, salaryForm);
    }
    setIsEditing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back button if viewing another employee as Admin */}
      {selectedEmployeeForView && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            onClick={() => setSelectedEmployeeForView(null)} 
            className="btn btn-outline btn-sm"
          >
            <ArrowLeft size={14} /> Back to My Profile / Dashboard
          </button>
          <span className="badge badge-approved">
            Viewing Profile: {targetUser.name} ({targetUser.employeeId})
          </span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #714b67 0%, #00a09d 100%)', height: '120px', position: 'relative' }} />
        
        <div style={{ padding: '1.5rem', marginTop: '-50px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <img 
              src={formData.avatar} 
              alt={formData.name} 
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid white',
                boxShadow: 'var(--shadow-md)',
              }}
            />
            <div style={{ marginTop: '35px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{targetUser.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                {targetUser.designation} • {targetUser.department}
              </p>
              <span className="badge badge-present" style={{ marginTop: '0.35rem' }}>
                ID: {targetUser.employeeId}
              </span>
            </div>
          </div>

          <div>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                <Edit size={16} /> Edit Profile Details
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setIsEditing(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button onClick={handleSaveProfile} className="btn btn-success">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)', background: '#fafafa', padding: '0 1.5rem' }}>
          <button 
            onClick={() => setActiveTab('personal')} 
            className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
            style={{ borderRadius: '0', borderBottom: activeTab === 'personal' ? '3px solid var(--primary)' : 'none' }}
          >
            Personal Details
          </button>
          <button 
            onClick={() => setActiveTab('job')} 
            className={`nav-item ${activeTab === 'job' ? 'active' : ''}`}
            style={{ borderRadius: '0', borderBottom: activeTab === 'job' ? '3px solid var(--primary)' : 'none' }}
          >
            Job & Work Info
          </button>
          <button 
            onClick={() => setActiveTab('salary')} 
            className={`nav-item ${activeTab === 'salary' ? 'active' : ''}`}
            style={{ borderRadius: '0', borderBottom: activeTab === 'salary' ? '3px solid var(--primary)' : 'none' }}
          >
            Salary Structure
          </button>
          <button 
            onClick={() => setActiveTab('documents')} 
            className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`}
            style={{ borderRadius: '0', borderBottom: activeTab === 'documents' ? '3px solid var(--primary)' : 'none' }}
          >
            Documents ({targetUser.documents.length})
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="card">
        {activeTab === 'personal' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Personal Information</h3>

            {!isEditing ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label className="form-label" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                  <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={16} color="var(--primary)" /> {targetUser.email}
                  </p>
                </div>

                <div>
                  <label className="form-label" style={{ color: 'var(--text-muted)' }}>Phone Number</label>
                  <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={16} color="var(--primary)" /> {targetUser.phone}
                  </p>
                </div>

                <div>
                  <label className="form-label" style={{ color: 'var(--text-muted)' }}>Residential Address</label>
                  <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={16} color="var(--primary)" /> {targetUser.address}
                  </p>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ color: 'var(--text-muted)' }}>Professional Bio</label>
                  <p style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    {targetUser.bio || 'No bio written yet.'}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name {isAdmin && '(Admin Editable)'}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.name}
                    disabled={!isAdmin}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Profile Image URL</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Bio / Summary</label>
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'job' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Job & Employment Details</h3>

            {!isEditing || !isAdmin ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label className="form-label" style={{ color: 'var(--text-muted)' }}>Employee ID</label>
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>{targetUser.employeeId}</p>
                </div>

                <div>
                  <label className="form-label" style={{ color: 'var(--text-muted)' }}>Job Designation</label>
                  <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building size={16} color="var(--primary)" /> {targetUser.designation}
                  </p>
                </div>

                <div>
                  <label className="form-label" style={{ color: 'var(--text-muted)' }}>Department</label>
                  <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building size={16} color="var(--primary)" /> {targetUser.department}
                  </p>
                </div>

                <div>
                  <label className="form-label" style={{ color: 'var(--text-muted)' }}>Reporting Manager</label>
                  <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={16} color="var(--primary)" /> {targetUser.managerName || 'Executive Board'}
                  </p>
                </div>

                <div>
                  <label className="form-label" style={{ color: 'var(--text-muted)' }}>Joining Date</label>
                  <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={16} color="var(--primary)" /> {targetUser.joinDate}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Job Title / Designation</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select 
                    className="form-control" 
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Finance">Finance</option>
                    <option value="People & Culture">People & Culture</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reporting Manager</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'salary' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Salary Breakdown Structure</h3>
              {isAdmin && !isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn btn-outline btn-sm">
                  <Edit size={14} /> Update Salary Structure
                </button>
              )}
            </div>

            {!isEditing || !isAdmin ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Basic Pay</span>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>${targetUser.salary.basic.toLocaleString()}</h4>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>House Rent Allowance (HRA)</span>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>${targetUser.salary.hra.toLocaleString()}</h4>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Special Allowance</span>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>${targetUser.salary.specialAllowance.toLocaleString()}</h4>
                </div>

                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fee2e2' }}>
                  <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>PF & Tax Deductions</span>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dc2626' }}>
                    -${(targetUser.salary.pfDeduction + targetUser.salary.taxDeduction).toLocaleString()}
                  </h4>
                </div>

                <div style={{ gridColumn: '1 / -1', background: 'var(--primary-light)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>ESTIMATED MONTHLY NET PAYABLE</span>
                    <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>${targetUser.salary.netSalary.toLocaleString()}</h3>
                  </div>
                  <DollarSign size={40} color="var(--primary)" />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Basic Salary ($)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={salaryForm.basic}
                    onChange={(e) => {
                      const basic = Number(e.target.value);
                      const net = basic + salaryForm.hra + salaryForm.conveyance + salaryForm.specialAllowance - salaryForm.pfDeduction - salaryForm.taxDeduction;
                      setSalaryForm({ ...salaryForm, basic, netSalary: net });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">HRA ($)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={salaryForm.hra}
                    onChange={(e) => {
                      const hra = Number(e.target.value);
                      const net = salaryForm.basic + hra + salaryForm.conveyance + salaryForm.specialAllowance - salaryForm.pfDeduction - salaryForm.taxDeduction;
                      setSalaryForm({ ...salaryForm, hra, netSalary: net });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Special Allowance ($)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={salaryForm.specialAllowance}
                    onChange={(e) => {
                      const specialAllowance = Number(e.target.value);
                      const net = salaryForm.basic + salaryForm.hra + salaryForm.conveyance + specialAllowance - salaryForm.pfDeduction - salaryForm.taxDeduction;
                      setSalaryForm({ ...salaryForm, specialAllowance, netSalary: net });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tax Deduction ($)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={salaryForm.taxDeduction}
                    onChange={(e) => {
                      const taxDeduction = Number(e.target.value);
                      const net = salaryForm.basic + salaryForm.hra + salaryForm.conveyance + salaryForm.specialAllowance - salaryForm.pfDeduction - taxDeduction;
                      setSalaryForm({ ...salaryForm, taxDeduction, netSalary: net });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Employee Document Records</h3>
              <button onClick={() => alert('Demo document upload complete!')} className="btn btn-outline btn-sm">
                <Upload size={14} /> Upload New Document
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {targetUser.documents.map(doc => (
                <div 
                  key={doc.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={28} color="var(--primary)" />
                    <div>
                      <strong style={{ fontSize: '0.9rem', display: 'block' }}>{doc.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {doc.category} • Uploaded {doc.uploadDate}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => alert(`Downloading sample file ${doc.name}`)} 
                    className="btn btn-outline btn-sm"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
