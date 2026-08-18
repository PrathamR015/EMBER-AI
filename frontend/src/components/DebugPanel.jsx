import React from 'react';

export default function DebugPanel({ trace, auditLogs }) {
  return (
    <div className="panel" style={{ width: '420px', background: 'var(--bg-primary)' }}>
      <div className="panel-header" style={{ justifyContent: 'space-between' }}>
        <span>🔍 Agent Debug & Audit Trace</span>
        <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.2)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '4px' }}>
          MCP & Rules Engine
        </span>
      </div>

      <div className="panel-body">
        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Latest Execution Steps
        </h4>

        {(!trace || trace.length === 0) ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
            No trace available yet. Send a request in chat to inspect real-time agent execution.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {trace.map((stepItem, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                    Step {idx + 1}: {stepItem.step}
                  </span>
                </div>

                <pre style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '8px',
                  borderRadius: '6px',
                  overflowX: 'auto',
                  color: '#d1d5db'
                }}>
                  {JSON.stringify(stepItem.data || stepItem, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}

        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginTop: '24px', marginBottom: '12px' }}>
          Hash-Chained Audit Trail ({auditLogs?.length || 0} Records)
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {auditLogs && auditLogs.slice(0, 5).map((log, idx) => (
            <div key={idx} style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', color: 'var(--accent-success)' }}>{log.step}</span>
                <span style={{ color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                Current Hash: {log.current_hash ? log.current_hash.substring(0, 16) + '...' : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
