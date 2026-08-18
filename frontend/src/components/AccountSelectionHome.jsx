import React, { useState } from 'react';

export default function AccountSelectionHome({ accounts, onLoginSuccess }) {
  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [accountType, setAccountType] = useState('Card - My Account');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(true);
  const [selectedDemoAccount, setSelectedDemoAccount] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle clicking a demo account card to auto-fill credentials
  const handleSelectDemoCard = (acc) => {
    setSelectedDemoAccount(acc);
    setUserIdInput(acc.account_id);
    setPasswordInput('user123'); // Demo password pre-filled as requested
    setErrorMsg('');
  };

  // Handle form submission / Log In button click
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    if (!userIdInput.trim()) {
      setErrorMsg('Please select or enter a User ID / Account ID.');
      return;
    }
    if (passwordInput !== 'user123') {
      setErrorMsg('Invalid password. Demo password for all accounts is "user123".');
      return;
    }

    setIsLoggingIn(true);
    setErrorMsg('');

    try {
      // Call backend JWT login endpoint
      const res = await fetch(`/api/auth/login?account_id=${encodeURIComponent(userIdInput.trim())}`, {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        onLoginSuccess(data.account_id, data.access_token);
      } else {
        setErrorMsg('Authentication failed. Please verify Account ID.');
      }
    } catch (err) {
      console.error('Login API error:', err);
      // Fallback local activation if backend is busy
      onLoginSuccess(userIdInput.trim(), 'demo-jwt-fallback-token');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div style={{ flex: 1, padding: '40px 60px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>

        {/* Top Section Header */}
        <div style={{ marginBottom: '28px', textAlign: 'left' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amex-blue-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
            Corporate Servicing
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Cardmember Sign In & Session Activation
          </h1>
        </div>

        {/* Amex Login Card — Inspired directly by UI-assets/Login.png */}
        <div style={{
          maxWidth: '440px',
          margin: '0 0 40px 0',
          background: '#ffffff',
          border: '1px solid #dcdcdc',
          borderRadius: '8px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
        }}>
          <h2 style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#2b2b2b',
            textAlign: 'center',
            marginBottom: '24px',
            letterSpacing: '-0.01em'
          }}>
            Log In to My Account
          </h2>

          <form onSubmit={handleSubmitLogin}>
            {/* User ID Field */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#333333', marginBottom: '6px' }}>
                User ID
              </label>
              <input
                type="text"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                placeholder="Account ID (e.g. ACC-1001)"
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  padding: '11px 14px',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)'
                }}
              />
            </div>

            {/* Password Field with Keyboard icon toggle */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#333333' }}>
                  Password
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: 600 }}>
                  Demo: <b>user123</b>
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Password (user123)"
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    padding: '11px 40px 11px 14px',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--amex-blue-primary)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  {showPassword ? '⌨ Hide' : '⌨ Show'}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--amex-blue-primary)' }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: '0.88rem', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
                Remember Me
              </label>
            </div>

            {errorMsg && (
              <div style={{ color: 'var(--accent-danger)', fontSize: '0.82rem', marginBottom: '16px', fontWeight: 600 }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Solid Blue Log In Button */}
            <button
              type="submit"
              disabled={isLoggingIn || !userIdInput}
              style={{
                width: '100%',
                background: 'var(--amex-blue-primary)',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 112, 210, 0.25)',
                opacity: isLoggingIn || !userIdInput ? 0.65 : 1
              }}
            >
              {isLoggingIn ? 'Authenticating...' : 'Log In'}
            </button>
          </form>
        </div>

        {/* Demo Indian Accounts Grid */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            Select Account Profile
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '18px' }}>
            {accounts.map((acc) => {
              const isSelected = selectedDemoAccount?.account_id === acc.account_id;
              return (
                <div
                  key={acc.account_id}
                  className={`amex-card ${isSelected ? 'amex-card-selected' : ''}`}
                  style={{ cursor: 'pointer', padding: '16px' }}
                  onClick={() => handleSelectDemoCard(acc)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--amex-blue-primary)' }}>
                      {acc.card_tier || 'Amex Platinum®'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {acc.account_id}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {acc.customer_name}
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div>Tenure: <b>{acc.tenure_months} mos</b></div>
                    <div>Limit: <b>${acc.credit_limit.toLocaleString()}</b></div>
                    <div>Balance: <b>${acc.current_balance.toLocaleString()}</b></div>
                    <div>Password: <b style={{ color: 'var(--accent-success)' }}>user123</b></div>
                  </div>

                  <div style={{ marginTop: '12px', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--amex-blue-primary)', fontWeight: 700 }}>
                      Select Profile →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
