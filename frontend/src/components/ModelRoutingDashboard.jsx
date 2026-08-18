import React, { useState, useEffect } from 'react';

export default function ModelRoutingDashboard() {
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/model-routing/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch model routing stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalCalls = stats?.total_routed_calls || 0;
  const promptTokens = stats?.total_prompt_tokens || 0;
  const completionTokens = stats?.total_completion_tokens || 0;
  const cost = stats?.total_cost_usd || 0.0;
  const modelDist = stats?.model_distribution || {};

  return (
    <div style={{ flex: 1, padding: '32px 48px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amex-blue-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
          OpenRouter Unified API Telemetry & Tiered Model Routing
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Model Routing Dashboard
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '800px' }}>
          Multi-model LLM orchestration powered by OpenRouter across <b>gemini-2.0-flash-lite</b>, <b>deepseek-r1</b>, and <b>llama-3.3-70b</b>.
        </p>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div className="amex-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total OpenRouter Calls</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amex-blue-primary)', marginTop: '6px' }}>
            {totalCalls}
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-success)', fontWeight: 600 }}>OpenRouter API Active</span>
        </div>

        <div className="amex-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Classifier Model</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
            Gemini 2.0 Flash Lite
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-success)', fontWeight: 600 }}>google/gemini-2.0-flash-lite-001</span>
        </div>

        <div className="amex-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Governor Reasoning</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-warning)', marginTop: '6px' }}>
            DeepSeek R1
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-warning)', fontWeight: 700 }}>deepseek/deepseek-r1</span>
        </div>

        <div className="amex-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Response Generator</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--amex-blue-primary)', marginTop: '6px' }}>
            Llama 3.3 70B
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>meta-llama/llama-3.3-70b-instruct</span>
        </div>
      </div>

      {/* Model Distribution & Free Pool Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        
        {/* Tier Routing Pools */}
        <div className="amex-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            OpenRouter Tier Routing Pools
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amex-blue-primary)', marginBottom: '4px' }}>
                Tier 1: Intent Classification (High-Speed Classifier)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                google/gemini-2.0-flash-lite-001
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-warning)', marginBottom: '4px' }}>
                Tier 2: Governor Compliance Deep Reasoning
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                deepseek/deepseek-r1
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-success)', marginBottom: '4px' }}>
                Tier 3: Response Generation & Formatting
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                meta-llama/llama-3.3-70b-instruct
              </div>
            </div>
          </div>
        </div>

        {/* Live Model Distribution */}
        <div className="amex-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Live Executed OpenRouter Distribution
          </h3>

          {Object.keys(modelDist).length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px 0' }}>
              No OpenRouter model calls executed yet in this session. Submit a prompt in the chat workspace!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(modelDist).map(([mName, count], idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--amex-blue-primary)', fontWeight: 700 }}>
                    {mName}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {count} calls
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
