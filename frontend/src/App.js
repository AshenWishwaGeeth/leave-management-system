import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { clearSession, getDashboardSummary, getMe, getStoredUser, hasSession } from './services/api';
import LoginPage from './components/LoginPage';
import EmployeeManagement from './components/EmployeeManagement';
import LeaveRequestPanel from './components/LeaveRequestPanel';
import LeaveHistory from './components/LeaveHistory';

function App() {
  const [user, setUser] = useState(getStoredUser());
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const role = user?.role?.toLowerCase() || 'employee';
  const canManageEmployees = role === 'manager';

  const tabs = useMemo(() => {
    const base = [{ key: 'dashboard', label: 'Dashboard' }, { key: 'history', label: 'Leave Status / History' }];
    if (role === 'employee') {
      base.splice(1, 0, { key: 'request', label: 'Request Leave' });
    }
    if (canManageEmployees) {
      base.push({ key: 'employees', label: 'Employee Management' });
      base.splice(1, 0, { key: 'approvals', label: 'Pending Requests' });
    }
    return base;
  }, [role, canManageEmployees]);

  useEffect(() => {
    if (!hasSession()) {
      return;
    }
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        clearSession();
        setUser(null);
      });
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    getDashboardSummary()
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(null));
  }, [user]);

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Leave Management System</h1>
          <p>Welcome {user.name} ({user.role})</p>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      <nav className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? 'active-tab' : ''}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-grid">
        {activeTab === 'dashboard' && (
          <section className="card stats-grid">
            <div className="stat-card"><h3>My Leave Balance</h3><p>{summary?.my_leave_balance ?? user.leave_balance ?? 0}</p></div>
            <div className="stat-card"><h3>Pending Requests</h3><p>{summary?.pending_requests ?? 0}</p></div>
            <div className="stat-card"><h3>Leave History</h3><p>{(summary?.approved_requests ?? 0) + (summary?.rejected_requests ?? 0)}</p></div>
            {canManageEmployees && <div className="stat-card"><h3>Total Employees</h3><p>{summary?.total_employees ?? 0}</p></div>}
          </section>
        )}

        {activeTab === 'request' && role === 'employee' && <LeaveRequestPanel user={user} />}

        {activeTab === 'approvals' && canManageEmployees && <LeaveHistory canApprove />}

        {activeTab === 'history' && <LeaveHistory canApprove={false} />}

        {activeTab === 'employees' && canManageEmployees && <EmployeeManagement canManage={canManageEmployees} />}
      </main>
    </div>
  );
}

export default App;
