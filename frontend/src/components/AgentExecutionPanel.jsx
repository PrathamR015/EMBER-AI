import React, { useState, useEffect } from 'react';

export default function AgentExecutionPanel({ trace, auditLogs, isProcessing }) {
  const [activeLayerIndex, setActiveLayerIndex] = useState(null);
  const [currentFlashingIndex, setCurrentFlashingIndex] = useState(-1);

  const layerDefinitions = [
    { key: "ACCOUNT_RETRIEVAL", layer: "Layer 1: FastMCP Context Retrieval", desc: "Session-bound account context API fetch" },
    { key: "POLICY_RAG", layer: "Layer 2: RAG Policy & Vector Search", desc: "Metadata pre-filter & semantic similarity re-ranking" },
    { key: "RULES_EVALUATION", layer: "Layer 3: Deterministic Rules Engine", desc: "Money math & policy constraints evaluated outside LLM" },
    { key: "GOVERNOR_VERIFICATION", layer: "Layer 4: Governor Compliance Gate", desc: "Redaction boundary & independent re-verification check" },
    { key: "ACTION_EXECUTION", layer: "Layer 5: Action Execution Layer", desc: "Idempotent write action with server-derived SHA-256 key" },
    { key: "ACTION_REJECTED", layer: "Layer 5: Action Rejection Boundary", desc: "Policy constraint enforcement rejection" },
    { key: "ESCALATED_TO_HUMAN", layer: "Layer 5: Human Escalation Gateway", desc: "Routing to Senior Servicing Specialist Console" }
  ];

  // Animate layer flashing during processing
  useEffect(() => {
    if (isProcessing) {
      setCurrentFlashingIndex(0);
      const interval = setInterval(() => {
        setCurrentFlashingIndex((prev) => (prev < 4 ? prev + 1 : 0));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setCurrentFlashingIndex(-1);
    }
  }, [isProcessing]);

  return (
    <div className="panel" style={{ width: '440px', background: '#ffffff' }}>
      <div className="panel-header">
        <span>Agent Orchestration</span>
        <span style={{ fontSize: '0.7rem', color: isProcessing ? 'var(--accent-warning)' : 'var(--amex-blue-primary)', background: 'var(--amex-blue-subtle)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
          {isProcessing ? 'Flashing Layer-wise Execution...' : '7-Layer Graph'}
        </span>
      </div>

      <div className="panel-body">
        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Agent Execution
        </div>

        {/* Execution Layers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(!trace || trace.length === 0) ? (
            layerDefinitions.slice(0, 5).map((def, idx) => {
              const isFlashing = currentFlashingIndex === idx;
              return (
                <div
                  key={idx}
                  className={`amex-card ${isFlashing ? 'layer-flashing' : ''}`}
                  style={{ padding: '14px', opacity: isProcessing ? 1 : 0.7 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isFlashing ? 'var(--amex-blue-primary)' : 'var(--text-primary)' }}>
                        {def.layer}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {def.desc}
                      </div>
                    </div>
                    {isFlashing && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-warning)', textTransform: 'uppercase' }}>
                        Executing...
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            trace.map((stepItem, idx) => {
              const stepName = stepItem.step || "STEP";
              const def = layerDefinitions.find(d => d.key === stepName) || { layer: `Layer: ${stepName}`, desc: "Agent step execution" };
              const isOpen = activeLayerIndex === idx;
              const isFlashing = currentFlashingIndex === idx;

              return (
                <div
                  key={idx}
                  className={`amex-card ${isFlashing ? 'layer-flashing' : ''}`}
                  style={{ padding: '14px' }}
                >
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setActiveLayerIndex(isOpen ? null : idx)}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--amex-blue-primary)' }}>
                        {def.layer}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {def.desc}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--amex-blue-primary)', fontWeight: 700 }}>
                      {isOpen ? "▲ Hide" : "▼ Inspect"}
                    </span>
                  </div>

                  {isOpen && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                      <pre style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        background: '#0f172a',
                        padding: '10px',
                        borderRadius: '6px',
                        overflowX: 'auto',
                        color: '#f8fafc',
                        lineHeight: '1.4'
                      }}>
                        {JSON.stringify(stepItem.data || stepItem, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Audit Log Trail */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Hash-Chained Audit Trail ({auditLogs?.length || 0} Records)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {auditLogs && auditLogs.slice(0, 4).map((log, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent-success)' }}>{log.step_name || log.step}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  Hash: {log.current_hash ? log.current_hash.substring(0, 20) + '...' : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
