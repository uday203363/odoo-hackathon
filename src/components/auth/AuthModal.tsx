import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';
import { ShieldCheck, Mail, Lock, X } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { users, switchUser, addToast } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form State
  const [signUpEmpId, setSignUpEmpId] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('employee');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(u => u.email.toLowerCase() === signInEmail.toLowerCase() || u.employeeId.toLowerCase() === signInEmail.toLowerCase());

    if (found) {
      switchUser(found.id);
      addToast(`Logged in successfully as ${found.name}`, 'success');
      onClose();
    } else {
      addToast('Invalid credentials or account not found in system!', 'error');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpPassword.length < 6) {
      addToast('Password must be at least 6 characters long for security.', 'error');
      return;
    }

    addToast(`Verification link sent to ${signUpEmail}! Account registration simulated.`, 'success');
    addToast('You can now log in or switch roles using the quick demo bar at the top.', 'info');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div className="modal-header" style={{ background: '#714b67', color: 'white' }}>
          <h3 className="modal-title" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} /> {mode === 'signin' ? 'Sign In to Dayflow HRMS' : 'Create HR Account'}
          </h3>
          <button onClick={onClose} style={{ color: 'white' }}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn}>
              <div className="form-group">
                <label className="form-label">Email or Employee ID</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ paddingLeft: '2rem' }}
                    placeholder="hr@dayflow.com or EMP-102"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" 
                    className="form-control" 
                    style={{ paddingLeft: '2rem' }}
                    placeholder="••••••••"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Sign In to Dashboard
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
                <button type="button" onClick={() => setMode('signup')} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  Register here
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp}>
              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="EMP-105"
                  required
                  value={signUpEmpId}
                  onChange={(e) => setSignUpEmpId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Jane Doe"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Work Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="jane.doe@dayflow.com"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password (min 6 chars)</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="••••••••"
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role Access</label>
                <select 
                  className="form-control"
                  value={signUpRole}
                  onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                >
                  <option value="employee">Employee (Standard Access)</option>
                  <option value="admin">Admin / HR Officer (Executive Access)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Register Account & Send Verification
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Already registered? </span>
                <button type="button" onClick={() => setMode('signin')} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
