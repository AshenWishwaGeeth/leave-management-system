import { useState } from 'react';
import { Alert, Button, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { requestLeave } from '../services/api';

const DEFAULT_LEAVE = {
  leave_type: 'Sick',
  start_date: '',
  end_date: '',
  reason: '',
};

const apiErrorMessage = (err) => err?.response?.data?.error || 'Request failed';

export default function LeaveRequestPanel({ user }) {
  const [form, setForm] = useState(DEFAULT_LEAVE);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await requestLeave({
        employee_id: user.id,
        leave_type: form.leave_type,
        start_date: `${form.start_date}T00:00:00Z`,
        end_date: `${form.end_date}T00:00:00Z`,
        reason: form.reason,
      });
      setSuccess('Leave request submitted successfully.');
      setForm(DEFAULT_LEAVE);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Request Leave</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Stack component="form" onSubmit={submit} spacing={2.5}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="leave-type-label">Leave Type</InputLabel>
                <Select
                  labelId="leave-type-label"
                  label="Leave Type"
                  value={form.leave_type}
                  onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
                >
                  <MenuItem value="Sick">Sick</MenuItem>
                  <MenuItem value="Casual">Casual</MenuItem>
                  <MenuItem value="Annual">Annual</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Start Date"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="End Date"
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>

          <TextField
            label="Reason / Notes"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            multiline
            minRows={3}
            fullWidth
          />

          <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>Submit Request</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
