import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { getLeaves, updateLeaveStatus } from '../services/api';

const apiErrorMessage = (err) => err?.response?.data?.error || 'Request failed';

export default function LeaveHistory({ canApprove }) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ status: '', from: '', to: '' });
  const [commentById, setCommentById] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const res = await getLeaves(filters);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(apiErrorMessage(err));
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, [filters.status, filters.from, filters.to]);

  const decision = async (id, status) => {
    setError('');
    setSuccess('');
    try {
      await updateLeaveStatus(id, { status, manager_comment: commentById[id] || '' });
      setSuccess(`Leave request ${status.toLowerCase()} successfully.`);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          {canApprove ? 'Pending Approval Requests' : 'Leave Status / History'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="From"
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="To"
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button fullWidth variant="outlined" onClick={() => window.print()}>Export / Print</Button>
          </Grid>
        </Grid>

        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                {canApprove && <TableCell>Action</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
            {items.map((lv) => (
              <TableRow key={lv.id} hover>
                <TableCell>{lv.employee?.name || lv.employee_id}</TableCell>
                <TableCell>{lv.leave_type}</TableCell>
                <TableCell>{String(lv.start_date).slice(0, 10)} to {String(lv.end_date).slice(0, 10)}</TableCell>
                <TableCell>{lv.reason}</TableCell>
                <TableCell>{lv.status}</TableCell>
                {canApprove && (
                  <TableCell>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                      <TextField
                        size="small"
                      placeholder="Comment"
                      value={commentById[lv.id] || ''}
                      onChange={(e) => setCommentById({ ...commentById, [lv.id]: e.target.value })}
                      />
                      <Button size="small" variant="contained" color="success" onClick={() => decision(lv.id, 'Approved')}>Approve</Button>
                      <Button size="small" variant="contained" color="error" onClick={() => decision(lv.id, 'Rejected')}>Reject</Button>
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
