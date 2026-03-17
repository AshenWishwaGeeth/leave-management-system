import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
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
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from '../services/api';

const DEFAULT_EMPLOYEE = {
  name: '',
  email: '',
  department: '',
  role: 'employee',
  status: 'active',
  password: 'welcome123',
};

const apiErrorMessage = (err) => err?.response?.data?.error || 'Request failed';

export default function EmployeeManagement({ canManage }) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [form, setForm] = useState(DEFAULT_EMPLOYEE);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const res = await getEmployees(filters);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(apiErrorMessage(err));
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, [filters.search, filters.role, filters.status]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await updateEmployee(editingId, form);
        setSuccess('Employee updated successfully.');
      } else {
        await createEmployee(form);
        setSuccess('Employee added successfully.');
      }
      setForm(DEFAULT_EMPLOYEE);
      setEditingId(null);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const edit = (employee) => {
    setEditingId(employee.id);
    setForm({
      name: employee.name || '',
      email: employee.email || '',
      department: employee.department || '',
      role: employee.role || 'employee',
      status: employee.status || 'active',
      password: '',
    });
  };

  const remove = async (id) => {
    setError('');
    setSuccess('');
    try {
      await deleteEmployee(id);
      setSuccess('Employee deleted successfully.');
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Employee Management</Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search name or email"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="filter-role-label">Role</InputLabel>
              <Select
                labelId="filter-role-label"
                label="Role"
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="filter-status-label">Status</InputLabel>
              <Select
                labelId="filter-status-label"
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {canManage && (
        <Box component="form" onSubmit={submit} sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="form-role-label">Role</InputLabel>
                <Select labelId="form-role-label" label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="form-status-label">Status</InputLabel>
                <Select labelId="form-status-label" label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained">{editingId ? 'Update Employee' : 'Add Employee'}</Button>
            </Grid>
          </Grid>
        </Box>
      )}

      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              {canManage && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((emp) => (
              <TableRow key={emp.id} hover>
                <TableCell>{emp.name}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell>{emp.role}</TableCell>
                <TableCell>{emp.status}</TableCell>
                {canManage && (
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => edit(emp)}>Edit</Button>
                      <Button size="small" color="error" variant="contained" onClick={() => remove(emp.id)}>Delete</Button>
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
