import React from 'react';

export default function AccountDetailsSidebar({ activeAccount, onSelectSuggestion, onChangeAccount }) {
  if (!activeAccount) return null;

  const suggestions = [
    { label: "Waive Late Fee ($35.00)", text: "Please evaluate and waive my late payment fee of $35.00" },
    { label: "Request Credit Limit Increase (+25%)", text: "I would like to request a credit limit increase on my account" },
    { label: "Order Replacement Card", text: "My physical card is damaged, please send a replacement card" },
    { label: "Inquire About Fee Policy", text: "What are the policy requirements for late fee reversals?" }
  ];

  return (
    <div className="panel" style={{ width: '340px', borderRight: '1px solid var(--border-subtle)' }}>
      <div className="panel-header">
        <span>Active Account Context</span>
        <button
          onClick={onChangeAccount}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--amex-blue-primary)',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Change Account
        </button>
      </div>

      <div className="panel-body">
        {/* Profile Card */}
        <div className="amex-card amex-card-selected" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--amex-blue-primary)', textTransform: 'uppercase' }}>
              {activeAccount.card_tier || 'Amex Cardmember'}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {activeAccount.account_id}
            </span>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
            {activeAccount.customer_name}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Tenure:</span>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{activeAccount.tenure_months} Months</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Credit Line:</span>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${activeAccount.credit_limit.toLocaleString()}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Balance:</span>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${activeAccount.current_balance.toLocaleString()}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>12-Mo Waivers:</span>
              <div style={{ fontWeight: 700, color: activeAccount.waiver_count_12mo > 0 ? 'var(--accent-warning)' : 'var(--text-primary)' }}>
                {activeAccount.waiver_count_12mo} Used
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: activeAccount.delinquent_status ? 'var(--accent-danger)' : 'var(--accent-success)', fontWeight: 700 }}>
            Status: {activeAccount.delinquent_status ? 'Past Due (Delinquent)' : 'Account Current (Good Standing)'}
          </div>
        </div>

        {/* Suggested Actions Section */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 700 }}>
            Suggested Servicing Actions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSuggestion(item.text)}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--amex-blue-primary)';
                  e.currentTarget.style.background = 'var(--amex-blue-subtle)';
                  e.currentTarget.style.color = 'var(--amex-blue-primary)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
