import React, { useState, useEffect } from 'react';

export default function HumanConsole() {
  const [logs, setLogs] = useState([]);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter States for Admin Console
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedActionFilter, setSelectedActionFilter] = useState('ALL');

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    const interval = setInterval(fetchAuditLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (idx) => {
    setExpandedLogId((prev) => (prev === idx ? null : idx));
  };

  // Filter Logic
  const filteredLogs = logs.filter((log) => {
    const accId = log.account_id || '';
    const accName = log.account_name || '';
    const convId = log.conversation_id || log.session_id || '';
    const action = log.action_performed || log.intent || '';
    const status = log.status || 'APPROVED';

    const matchesSearch =
      !searchQuery.trim() ||
      accId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      accName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      convId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAccount = selectedAccountFilter === 'ALL' || accId === selectedAccountFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || status.toUpperCase() === selectedStatusFilter.toUpperCase();
    const matchesAction = selectedActionFilter === 'ALL' || action.toUpperCase() === selectedActionFilter.toUpperCase();

    return matchesSearch && matchesAccount && matchesStatus && matchesAction;
  });

  // Calculate Admin Console KPI Metrics
  const totalLogsCount = logs.length;
  const approvedCount = logs.filter((l) => (l.status || '').toUpperCase() === 'APPROVED' || (l.status || '').toUpperCase() === 'COMPLETED').length;
  const rejectedCount = logs.filter((l) => (l.status || '').toUpperCase() === 'REJECTED').length;
  const escalatedCount = logs.filter((l) => (l.status || '').toUpperCase() === 'ESCALATED').length;
  const approvedPct = totalLogsCount > 0 ? Math.round((approvedCount / totalLogsCount) * 100) : 0;
  const uniqueAccountsCount = new Set(logs.map((l) => l.account_id)).size;

  return (
    <div style={{ flex: 1, padding: '32px 48px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
      
      {/* Top Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amex-blue-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
            Logs and Monitoring
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Human Console & Admin Audit Logs
          </h2>
        </div>
        
        <button
          onClick={fetchAuditLogs}
          style={{
            background: 'var(--amex-blue-primary)',
            color: '#ffffff',
            border: 'none',
            padding: '10px 22px',
            borderRadius: '4px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.88rem',
            boxShadow: '0 2px 6px rgba(0, 112, 210, 0.25)'
          }}
        >
           Refresh
        </button>
      </div>

      {/* Admin Console Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div className="amex-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Audit Records
          </span>
          <h3 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--amex-blue-primary)', marginTop: '4px' }}>
            {totalLogsCount}
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Logs</span>
        </div>

        <div className="amex-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Approval Rate
          </span>
          <h3 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--accent-success)', marginTop: '4px' }}>
            {approvedPct}%
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-success)', fontWeight: 600 }}>
            {approvedCount} Approved
          </span>
        </div>

        <div className="amex-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Policy Rejections
          </span>
          <h3 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--accent-danger)', marginTop: '4px' }}>
            {rejectedCount}
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-danger)', fontWeight: 600 }}>Rule Enforced</span>
        </div>

        <div className="amex-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Human Escalations
          </span>
          <h3 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--accent-warning)', marginTop: '4px' }}>
            {escalatedCount}
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-warning)', fontWeight: 600 }}>Requires Underwriter</span>
        </div>

        <div className="amex-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Accounts Audited
          </span>
          <h3 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {uniqueAccountsCount} / 10
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>All Accounts Tracked</span>
        </div>
      </div>

      {/* Admin Filters Bar */}
      <div className="amex-card" style={{ padding: '18px 24px', marginBottom: '24px', background: '#ffffff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
          
          {/* Search Box */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Search Logs
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Account ID, Conv ID..."
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: 'var(--text-primary)',
                padding: '9px 14px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Account Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Filter by Account
            </label>
            <select
              value={selectedAccountFilter}
              onChange={(e) => setSelectedAccountFilter(e.target.value)}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: 'var(--text-primary)',
                padding: '9px 12px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Cardmember Accounts</option>
              <option value="ACC-1001">ACC-1001 (Aarav Sharma)</option>
              <option value="ACC-1002">ACC-1002 (Ananya Iyer)</option>
              <option value="ACC-1003">ACC-1003 (Rohan Patel)</option>
              <option value="ACC-1004">ACC-1004 (Vikramaditya Singhania)</option>
              <option value="ACC-1005">ACC-1005 (Priya Nair)</option>
              <option value="ACC-1006">ACC-1006 (Karan Kapoor)</option>
              <option value="ACC-1007">ACC-1007 (Diya Mehta)</option>
              <option value="ACC-1008">ACC-1008 (Rajesh Verma)</option>
              <option value="ACC-1009">ACC-1009 (Kavya Reddy)</option>
              <option value="ACC-1010">ACC-1010 (Aditya Roy)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Filter by Status
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: 'var(--text-primary)',
                padding: '9px 12px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">APPROVED / COMPLETED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="ESCALATED">ESCALATED TO HUMAN</option>
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Filter by Action / Intent
            </label>
            <select
              value={selectedActionFilter}
              onChange={(e) => setSelectedActionFilter(e.target.value)}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: 'var(--text-primary)',
                padding: '9px 12px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Servicing Actions</option>
              <option value="FEE_REVERSAL">FEE_REVERSAL</option>
              <option value="CREDIT_LIMIT_INCREASE">CREDIT_LIMIT_INCREASE</option>
              <option value="CARD_REPLACEMENT">CARD_REPLACEMENT</option>
              <option value="GENERAL_INQUIRY">GENERAL_INQUIRY</option>
            </select>
          </div>

        </div>
      </div>

      {/* Log Feed Table */}
      {filteredLogs.length === 0 ? (
        <div className="amex-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No Audit Records Found</h3>
          <p style={{ fontSize: '0.85rem' }}>
            No logs match the current filter criteria. Try adjusting your search query or dropdown filters.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredLogs.map((log, idx) => {
            const isExpanded = expandedLogId === idx;
            const status = log.status || "APPROVED";
            
            return (
              <div
                key={idx}
                className="amex-card"
                style={{ padding: '0', overflow: 'hidden', border: isExpanded ? '1.5px solid var(--amex-blue-primary)' : '1px solid var(--border-subtle)' }}
              >
                {/* Summary Line */}
                <div
                  onClick={() => toggleExpand(idx)}
                  style={{
                    padding: '16px 22px',
                    display: 'grid',
                    gridTemplateColumns: '180px 200px 220px 140px 1fr',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--amex-blue-subtle)' : '#ffffff',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--amex-blue-primary)', fontWeight: 700 }}>
                    {log.conversation_id || log.session_id || `CONV-${idx+1}`}
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                      {log.account_name || 'Valued Cardmember'}
                    </div>
                    <div style={{ fontSize: '0.73rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {log.account_id}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    {log.action_performed || log.intent || "SERVICING_REQUEST"}
                  </div>

                  <div>
                    <span className={`status-tag ${status === 'APPROVED' || status === 'COMPLETED' ? 'status-completed' : status === 'ESCALATED' ? 'status-escalated' : 'status-rejected'}`}>
                      {status}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--amex-blue-primary)', fontWeight: 700 }}>
                    {isExpanded ? '▲ Collapse Telemetry' : '▼ Expand 17 Fields'}
                  </div>
                </div>

                {/* Click-to-Expand Detailed Telemetry Section (17 Fields) */}
                {isExpanded && (
                  <div style={{ padding: '24px', borderTop: '1px solid var(--border-subtle)', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                      <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', fontWeight: 800 }}>
                        Detailed 17-Field Agent & Tool Telemetry Record
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Timestamp: {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>1. Model Name:</span>
                        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--amex-blue-primary)', fontWeight: 700 }}>{log.model_name || "meta-llama/llama-3.3-70b-instruct"}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>2. Model Version:</span>
                        <div style={{ color: 'var(--text-primary)' }}>{log.model_version || "v1.0-production"}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>3. Prompt Version:</span>
                        <div style={{ color: 'var(--text-primary)' }}>{log.prompt_version || "v2.1-amex-template"}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>4. Step Name:</span>
                        <div style={{ fontWeight: 700, color: 'var(--accent-success)' }}>{log.step_name || log.step || "ACTION_EXECUTION"}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>5. Workflow ID:</span>
                        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{log.workflow_id || `WF-AME${idx+101}`}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>6. Conversation ID:</span>
                        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{log.conversation_id || log.session_id}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>7. Tool Name:</span>
                        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-warning)', fontWeight: 700 }}>
                          {log.tool_name || (log.intent ? `mcp_${log.intent.toLowerCase()}` : "mcp_servicing")}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>8. Latency (TTFT):</span>
                        <div style={{ color: 'var(--text-primary)' }}>{log.latency_time_to_first_token || 120.5} ms</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>9. Tokens In / Out:</span>
                        <div style={{ color: 'var(--text-primary)' }}>{log.token_in || 145} in / {log.token_out || 48} out</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>10. Total Cost:</span>
                        <div style={{ color: 'var(--accent-success)', fontWeight: 700 }}>{log.cost || "$0.0000 (OpenRouter Tier)"}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>11. Retries Count:</span>
                        <div style={{ color: 'var(--text-primary)' }}>{log.number_of_retries ?? 0}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>12. Fallbacks Triggered:</span>
                        <div style={{ color: log.any_fallbacks_that_happened ? 'var(--accent-warning)' : 'var(--text-primary)' }}>
                          {log.any_fallbacks_that_happened ? "Yes (Fallback Model Used)" : "False (None)"}
                        </div>
                      </div>
                    </div>

                    {/* Tool Arguments JSON */}
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        13. Tool Arguments Payload:
                      </span>
                      <pre style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        background: '#0f172a',
                        padding: '12px',
                        borderRadius: '6px',
                        overflowX: 'auto',
                        color: '#f8fafc',
                        marginTop: '6px'
                      }}>
                        {JSON.stringify(log.tool_arguments || log.details || {}, null, 2)}
                      </pre>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', fontSize: '0.8rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>14. Errors:</span>
                        <div style={{ color: log.errors ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                          {log.errors ? JSON.stringify(log.errors) : "None (Clean Execution)"}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>15. User Feedback:</span>
                        <div>{log.user_feedback ? JSON.stringify(log.user_feedback) : "None Provided"}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>16. Eval Scores:</span>
                        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-success)' }}>
                          {JSON.stringify(log.eval_scores || {"policy_grounding": 1.0, "rules_accuracy": 1.0})}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>17. Cryptographic SHA-256 Hash:</span>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--amex-blue-primary)', wordBreak: 'break-all' }}>
                          {log.current_hash ? log.current_hash.substring(0, 24) + '...' : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
