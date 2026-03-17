import { useEffect, useMemo, useState } from 'react';
import { Alert, AppBar, Box, Button, Card, CardContent, Chip, Container, Grid, Stack, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import { clearSession, getDashboardSummary, getMe, getStoredUser, hasSession } from './services/api';
import LoginPage from './components/LoginPage';
import EmployeeManagement from './components/EmployeeManagement';
import LeaveRequestPanel from './components/LeaveRequestPanel';
import LeaveHistory from './components/LeaveHistory';

function App() {
  const [user, setUser] = useState(getStoredUser());
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState('');
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
    if (!user || activeTab !== 'dashboard') {
      return;
    }
    getDashboardSummary()
      .then((res) => { setSummary(res.data); setSummaryError(''); })
      .catch((err) => {
        setSummary(null);
        setSummaryError(err?.response?.data?.error || 'Failed to load dashboard data. Please try again.');
      });
  }, [user, activeTab]);

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
            {summaryError && (
              <Grid item xs={12}>
                <Alert severity="error" onClose={() => setSummaryError('')}>{summaryError}</Alert>
              </Grid>
            )}
            {!canManageEmployees && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">My Leave Balance</Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>{summary?.my_leave_balance ?? user.leave_balance ?? 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Pending Requests</Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>{summary?.pending_requests ?? 0}</Typography>
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
            {role === 'employee' && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid #d9e6ff',
                    boxShadow: '0 10px 30px rgba(15, 39, 71, 0.08)',
                  }}
                >
                  <Box
                    sx={{
                      px: { xs: 2, md: 3 },
                      py: { xs: 2, md: 2.5 },
                      background: 'linear-gradient(120deg, #0f2747 0%, #194b8f 100%)',
                      color: '#fff',
                    }}
                  >
                    <Chip
                      label="Employee Guide"
                      size="small"
                      sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Employee Dashboard Overview
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.95, maxWidth: 900 }}>
                      Use this dashboard to monitor your leave balance, follow request progress, and plan future leave with confidence.
                    </Typography>
                  </Box>

                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f6f9ff', border: '1px solid #e1ebff', height: '100%' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f2747', mb: 0.5 }}>
                            1. Submit Leave Requests
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Go to Request Leave to create new applications with clear dates and reasons.
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f6f9ff', border: '1px solid #e1ebff', height: '100%' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f2747', mb: 0.5 }}>
                            2. Track Status and History
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Check Leave Status / History to review pending, approved, and rejected requests.
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f6f9ff', border: '1px solid #e1ebff', height: '100%' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f2747', mb: 0.5 }}>
                            3. Confirm Leave Balance
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Review your available balance before applying to improve approval readiness.
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
            {canManageEmployees && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid #f4d8b5',
                    boxShadow: '0 10px 30px rgba(96, 58, 18, 0.12)',
                  }}
                >
                  <Box
                    sx={{
                      px: { xs: 2, md: 3 },
                      py: { xs: 2, md: 2.5 },
                      background: 'linear-gradient(120deg, #7a3e00 0%, #c26a17 100%)',
                      color: '#fff',
                    }}
                  >
                    <Chip
                      label="Manager Guide"
                      size="small"
                      sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      How To Approve Leave Requests
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.95, maxWidth: 900 }}>
                      Follow this workflow to review requests consistently, make timely decisions, and maintain transparent leave governance across the company.
                    </Typography>
                  </Box>

                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fff8f0', border: '1px solid #ffe5c6', height: '100%' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7a3e00', mb: 0.5 }}>
                            1. Open Pending Requests
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Go to the Pending Requests tab to view all leave applications awaiting review.
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fff8f0', border: '1px solid #ffe5c6', height: '100%' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7a3e00', mb: 0.5 }}>
                            2. Validate Request Details
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Check leave dates, employee balance, and business impact before making a decision.
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fff8f0', border: '1px solid #ffe5c6', height: '100%' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7a3e00', mb: 0.5 }}>
                            3. Approve Or Reject Clearly
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Choose Approve or Reject with a clear rationale to ensure fair and auditable decisions.
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fff8f0', border: '1px solid #ffe5c6', height: '100%' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7a3e00', mb: 0.5 }}>
                            4. Monitor Dashboard Metrics
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Use the dashboard chips and totals to track pending load and overall approval trends.
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
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
