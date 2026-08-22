import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, User, Lock, Mail, ArrowRight, AlertCircle, Info, Key, ShieldAlert, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter your Email or Employee ID and Password.');
      return;
    }

    setError('');
    setLoading(true);
    const result = await login(identifier, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Invalid credentials');
    }
  };

  const handleQuickFill = (emailVal: string, passVal: string) => {
    setIdentifier(emailVal);
    setPassword(passVal);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #714b67 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: 'var(--font)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 500,
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(16px)',
        borderRadius: 'var(--r-xl)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Top Branding Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
          padding: '2.25rem 2rem',
          color: '#fff',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.15)',
            marginBottom: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#714B67"/>
              <circle cx="15" cy="20" r="7" fill="#00A09D"/>
              <circle cx="25" cy="20" r="7" fill="white" fillOpacity=".9"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-.5px' }}>Dayflow <span style={{ color: 'var(--accent)' }}>HRMS</span></h1>
          <p style={{ fontSize: '.88rem', opacity: 0.85, marginTop: '.25rem' }}>Select Role & Sign In to Super Admin, HR, or Employee Portal</p>
        </div>

        {/* Login Form */}
        <div style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              background: 'var(--red-bg)',
              border: '1px solid #fecaca',
              color: 'var(--red)',
              padding: '.75rem 1rem',
              borderRadius: 'var(--r-md)',
              fontSize: '.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address or Employee ID</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="superadmin@dayflow.com, hr@dayflow.com, or EMP-106"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: '1.25rem', height: 48, fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight size={16} />
            </button>
          </form>

          {/* 3 Portal Quick Select Buttons */}
          <div style={{
            marginTop: '1.5rem',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: '1rem',
            fontSize: '.8rem'
          }}>
            <div style={{ fontWeight: 800, color: 'var(--text-1)', marginBottom: '.65rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <Key size={14} color="var(--primary)" /> 3 Separate Dashboard Accounts (Click to Fill)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              {/* 1. Super Admin Button */}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleQuickFill('superadmin@dayflow.com', 'admin@123')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textTransform: 'none', textAlign: 'left', borderColor: '#4f46e5', background: 'rgba(79, 70, 229, 0.05)' }}
              >
                <span>👑 <strong>1. Super Admin Dashboard:</strong> superadmin@dayflow.com</span>
                <span style={{ color: '#4f46e5', fontWeight: 800 }}>admin@123</span>
              </button>

              {/* 2. HR Officer (Elena Rostova) Button */}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleQuickFill('hr@dayflow.com', 'admin@123')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textTransform: 'none', textAlign: 'left', borderColor: 'var(--primary-mid)' }}
              >
                <span>🛡️ <strong>2. HR Officer (Elena Rostova):</strong> hr@dayflow.com</span>
                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>admin@123</span>
              </button>

              {/* 3. Employee Button */}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleQuickFill('uday@dayflow.com', 'join@123')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textTransform: 'none', textAlign: 'left' }}
              >
                <span>👤 <strong>3. Employee Dashboard:</strong> uday@dayflow.com</span>
                <span style={{ color: 'var(--accent)', fontWeight: 800 }}>join@123</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
