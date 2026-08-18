import React from 'react';

export default function AccountSelector({ accounts, selectedAccountId, onSelectAccount, activeAccount }) {
  return (
    <div className="panel" style={{ borderRight: '1px solid var(--border-subtle)' }}>
      <div className="panel-header">
        <span>👤 Account Simulator</span>
      </div>
      <div className="panel-body">
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Select a test account context. The account ID is bound to trusted session context, never extracted from conversation text.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {accounts.map((acc) => {
            const isSelected = acc.account_id === selectedAccountId;
            return (
              <div
                key={acc.account_id}
                className="glass-card"
                onClick={() => onSelectAccount(acc.account_id)}
                style={{
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(31, 41, 61, 0.4)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{acc.customer_name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                    {acc.account_id}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <div>Tenure: <b>{acc.tenure_months} mos</b></div>
                  <div>Limit: <b>${acc.credit_limit}</b></div>
                  <div>Waivers (12mo): <b style={{ color: acc.waiver_count_12mo > 0 ? 'var(--accent-warning)' : 'inherit' }}>{acc.waiver_count_12mo}</b></div>
                  <div>Balance: <b>${acc.current_balance}</b></div>
                </div>

                {acc.fee_history && acc.fee_history.length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Latest Fee:</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: acc.fee_history[0].status === 'WAIVED' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                      <span>{acc.fee_history[0].fee_type} (${acc.fee_history[0].amount})</span>
                      <span className={`status-badge ${acc.fee_history[0].status === 'WAIVED' ? 'status-completed' : 'status-rejected'}`}>
                        {acc.fee_history[0].status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
