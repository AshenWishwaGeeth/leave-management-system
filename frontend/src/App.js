import { useEffect, useMemo, useState } from 'react';
import { AppBar, Box, Button, Card, CardContent, Chip, Container, Grid, Stack, Tab, Tabs, Toolbar, Typography } from '@mui/material';
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

  const activeTabIndex = Math.max(0, tabs.findIndex((tab) => tab.key === activeTab));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fc' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#0f2747' }}>
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Leave Management System</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Welcome {user.name} ({user.role})
            </Typography>
          </Stack>
          <Button variant="outlined" color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Card sx={{ borderRadius: 3, mb: 2 }}>
          <CardContent sx={{ pb: '8px !important' }}>
            <Tabs
              value={activeTabIndex}
              onChange={(_, idx) => setActiveTab(tabs[idx].key)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs.map((tab) => (
                <Tab key={tab.key} label={tab.label} />
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {activeTab === 'dashboard' && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">My Leave Balance</Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>{summary?.my_leave_balance ?? user.leave_balance ?? 0}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Pending Requests</Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>{summary?.pending_requests ?? 0}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Leave History</Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>{(summary?.approved_requests ?? 0) + (summary?.rejected_requests ?? 0)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            {canManageEmployees && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">Total Employees</Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>{summary?.total_employees ?? 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip color="primary" label={`Pending: ${summary?.pending_requests ?? 0}`} />
                    <Chip color="success" label={`Approved: ${summary?.approved_requests ?? 0}`} />
                    <Chip color="error" label={`Rejected: ${summary?.rejected_requests ?? 0}`} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 'request' && role === 'employee' && <LeaveRequestPanel user={user} />}

        {activeTab === 'approvals' && canManageEmployees && <LeaveHistory canApprove />}

        {activeTab === 'history' && <LeaveHistory canApprove={false} />}

        {activeTab === 'employees' && canManageEmployees && <EmployeeManagement canManage={canManageEmployees} />}
      </Container>
    </Box>
  );
}

export default App;
