import React, { useState, useEffect } from 'react';
import AccountSelectionHome from './components/AccountSelectionHome.jsx';
import AccountDetailsSidebar from './components/AccountDetailsSidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import AgentExecutionPanel from './components/AgentExecutionPanel.jsx';
import ModelRoutingDashboard from './components/ModelRoutingDashboard.jsx';
import HumanConsole from './components/HumanConsole.jsx';

export default function App() {
  const [activeView, setActiveView] = useState('home'); // 'home', 'servicing', 'router', 'escalations'
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentTrace, setCurrentTrace] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchAuditLogs();
  }, []);

  const activeAccount = accounts.find((a) => a.account_id === selectedAccountId);

  // Workflow Action 1: Authenticate session from Login Box on Home Page
  const handleLoginSuccess = (accId, token) => {
    setSelectedAccountId(accId);
    setJwtToken(token);
    setMessages([]);
    setCurrentTrace([]);
    setActiveView('servicing');
  };

  // Workflow Action 2: Sign Out / Change Account
  const handleNewSession = () => {
    setSelectedAccountId(null);
    setJwtToken(null);
    setMessages([]);
    setCurrentTrace([]);
    setActiveView('home');
  };

  // Workflow Action 3: Send Authenticated Chat Message
  const handleSendMessage = async (text) => {
    if (!selectedAccountId) return;

    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          message: text,
          account_id: selectedAccountId,
          session_id: `session-amex-${Date.now()}`
        })
      });

      if (res.ok) {
        const data = await res.json();
        const agentMsg = {
          sender: 'agent',
          text: data.response,
          intent: data.intent,
          status: data.status
        };
        setMessages((prev) => [...prev, agentMsg]);
        setCurrentTrace(data.trace || []);
        fetchAccounts(); // Refresh balance & limits
        fetchAuditLogs(); // Refresh audit trail in MongoDB
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'agent', text: 'Error communicating with servicing backend.' }
        ]);
      }
    } catch (err) {
      console.error('Chat API Error:', err);
      setMessages((prev) => [
        ...prev,
        { sender: 'agent', text: 'Network connection error to EMBER API.' }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-container">
      {/* Amex Navbar matching UI-assets/navbar.png */}
      <header className="amex-navbar">
        <div className="amex-brand">
          {/* Logo: Blue text, Blue border, White background */}
          <div className="ember-logo-box">EMBER</div>
          <div>
            <div className="brand-title">EMBER Customer Servicing Platform</div>
            <div className="brand-tagline">
              Every Move Backed by Evidence & Reason
            </div>
          </div>
        </div>

        {/* Header Navigation Controls */}
        <div className="nav-controls">
          {activeView !== 'home' && (
            <button className="btn-signout" onClick={handleNewSession}>
              ← Sign Out / Switch Account
            </button>
          )}

          <div style={{ display: 'flex', gap: '6px' }}>
            {selectedAccountId && (
              <button
                className={`nav-tab-btn ${activeView === 'servicing' ? 'active' : ''}`}
                onClick={() => setActiveView('servicing')}
              >
                Servicing Workspace
              </button>
            )}
            <button
              className={`nav-tab-btn ${activeView === 'router' ? 'active' : ''}`}
              onClick={() => setActiveView('router')}
            >
              Model Routing
            </button>
            <button
              className={`nav-tab-btn ${activeView === 'escalations' ? 'active' : ''}`}
              onClick={() => setActiveView('escalations')}
            >
              Human Console
            </button>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="main-content">
        {activeView === 'home' && (
          <AccountSelectionHome
            accounts={accounts}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {activeView === 'servicing' && activeAccount && (
          <div className="servicing-grid">
            <AccountDetailsSidebar
              activeAccount={activeAccount}
              onSelectSuggestion={handleSendMessage}
              onChangeAccount={handleNewSession}
            />
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
              activeAccount={activeAccount}
            />
            <AgentExecutionPanel
              trace={currentTrace}
              auditLogs={auditLogs}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {activeView === 'router' && <ModelRoutingDashboard />}
        {activeView === 'escalations' && <HumanConsole />}
      </main>
    </div>
  );
}
