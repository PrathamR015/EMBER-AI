import React, { useState } from 'react';

export default function ChatWindow({ messages, onSendMessage, isProcessing, activeAccount }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="panel" style={{ flex: 1, borderRight: '1px solid var(--border-subtle)', background: '#ffffff' }}>
      <div className="panel-header">
        <span>Servicing Assistant Workspace</span>
        {activeAccount && (
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: 700 }}>
            Session Locked: {activeAccount.customer_name} ({activeAccount.account_id})
          </span>
        )}
      </div>

      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', margin: 'auto', maxWidth: '440px', color: 'var(--text-muted)' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.2rem', fontWeight: 800 }}>
              Card Automated Servicing
            </h3>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '20px' }}>
              Ask to waive late fees, increase credit limits, order replacement cards, or review policy requirements for <b>{activeAccount?.customer_name}</b>.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '82%'
            }}
          >
            <div
              style={{
                background: msg.sender === 'user' ? 'var(--amex-blue-primary)' : '#ffffff',
                color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                padding: '12px 18px',
                borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              {msg.text}
            </div>
            {msg.intent && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '8px', alignSelf: 'flex-start', alignItems: 'center' }}>
                <span>Intent: <b>{msg.intent}</b></span>
                <span>•</span>
                <span className={`status-tag ${msg.status === 'COMPLETED' ? 'status-completed' : msg.status === 'ESCALATED' ? 'status-escalated' : 'status-rejected'}`}>
                  {msg.status}
                </span>
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div style={{ alignSelf: 'flex-start', color: 'var(--amex-blue-primary)', fontSize: '0.85rem', fontWeight: 600, padding: '8px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            Processing request...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', background: '#ffffff', display: 'flex', gap: '12px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Inquire or request servicing for ${activeAccount?.customer_name || 'account'}...`}
          style={{
            flex: 1,
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            color: 'var(--text-primary)',
            padding: '12px 16px',
            borderRadius: '6px',
            outline: 'none',
            fontSize: '0.9rem'
          }}
        />
        <button
          type="submit"
          disabled={isProcessing || !input.trim()}
          style={{
            background: 'var(--amex-blue-primary)',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            opacity: isProcessing || !input.trim() ? 0.5 : 1
          }}
        >
          Send Request
        </button>
      </form>
    </div>
  );
}
